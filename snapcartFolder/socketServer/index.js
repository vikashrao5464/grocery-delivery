import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';

dotenv.config();

const app=express();
app.use(express.json({limit:'100kb'}));
const server=http.createServer(app);
const port=process.env.PORT || 5000;
const isLocalDevelopment=process.env.NEXT_BASE_URL?.startsWith('http://localhost');
const socketSecret=process.env.SOCKET_INTERNAL_SECRET || (isLocalDevelopment ? 'snapcart-local-development-only' : undefined);

if(!socketSecret) throw new Error('SOCKET_INTERNAL_SECRET is required outside localhost development');

const internalHeaders={'x-socket-secret':socketSecret};

function verifySocketToken(token){
  if(typeof token!=='string') return null;
  const [payload,signature]=token.split('.');
  if(!payload || !signature) return null;
  const expected=createHmac('sha256',socketSecret).update(payload).digest('base64url');
  const suppliedBuffer=Buffer.from(signature);
  const expectedBuffer=Buffer.from(expected);
  if(suppliedBuffer.length!==expectedBuffer.length || !timingSafeEqual(suppliedBuffer,expectedBuffer)) return null;

  try{
    const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
    return data.userId && data.exp>Date.now() ? data : null;
  }catch{
    return null;
  }
}

const io=new Server(server,{cors:{origin:process.env.NEXT_BASE_URL}});

io.use((socket,next)=>{
  const identity=verifySocketToken(socket.handshake.auth?.token);
  if(!identity) return next(new Error('Unauthorized'));
  socket.data.userId=identity.userId;
  next();
});

io.on('connection',(socket)=>{
  socket.on('identity',async ()=>{
    try{
      await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`,{
        userId:socket.data.userId,
        socketId:socket.id
      },{headers:internalHeaders});
    }catch(error){
      console.error('Error registering socket identity:',error.response?.data || error.message);
    }
  });

  socket.on('update-location',async ({latitude,longitude})=>{
    if(!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const userId=socket.data.userId;
    const location={type:'Point',coordinates:[longitude,latitude]};
    try{
      await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`,{
        userId,
        location
      },{headers:internalHeaders});
      io.emit('update-deliveryBoy-location',{userId,location});
    }catch(error){
      console.error('Error updating location:',error.response?.data || error.message);
    }
  });

  socket.on('join-room',(roomId)=>{
    if(typeof roomId==='string' && roomId.length<=100) socket.join(roomId);
  });

  socket.on('send-message',async (incomingMessage)=>{
    const message={...incomingMessage,senderId:socket.data.userId};
    try{
      await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`,message,{headers:internalHeaders});
      io.to(message.roomId).emit('send-message',message);
    }catch(error){
      console.error('Error saving message:',error.response?.data || error.message);
    }
  });

  socket.on('disconnect',async ()=>{
    try{
      await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/disconnect`,{
        socketId:socket.id
      },{headers:internalHeaders});
    }catch(error){
      console.error('Error updating disconnected user:',error.response?.data || error.message);
    }
  });
});

app.post('/notify',(req,res)=>{
  if(req.headers['x-socket-secret']!==socketSecret){
    return res.status(401).json({success:false,message:'Unauthorized'});
  }

  const {event,data,socketId,socketIds}=req.body;
  if(typeof event!=='string') return res.status(400).json({success:false,message:'Invalid event'});

  if(Array.isArray(socketIds) && socketIds.length>0){
    io.to(socketIds).emit(event,data);
  }else if(socketId){
    io.to(socketId).emit(event,data);
  }else{
    io.emit(event,data);
  }
  return res.status(200).json({success:true});
});

app.get('/health',(_req,res)=>res.status(200).json({status:'ok'}));

server.listen(port,()=>{
  console.log(`server is running on port ${port}`);
});
