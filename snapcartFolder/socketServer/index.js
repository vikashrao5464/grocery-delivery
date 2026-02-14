import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import axios from 'axios';

// Imports and Setup
// express: Web framework for handling HTTP requests
// http: Node.js module to create an HTTP server
// dotenv: Loads environment variables from a .env file
// Socket.IO: Enables real-time, bidirectional communication between clients and server
dotenv.config();
const app=express();
// Initializes an Express application to handle HTTP requests and responses. This app will be used to create an HTTP server that Socket.IO can attach to, allowing for real-time communication with clients.
app.use(express.json());

const server=http.createServer(app);
// Creates an Express app and wraps it in an HTTP server (required for Socket.IO).


const port=process.env.PORT || 5000;

// Creates a new Socket.IO server instance, allowing cross-origin requests from the specified origin in the environment variable NEXT_BASE_URL. This setup enables real-time communication between the server and clients (e.g., a Next.js frontend) running on that URL.
const io=new Server(server,{
  cors:{
    origin:process.env.NEXT_BASE_URL
  }
})

// Listens for new client connections to the Socket.IO server
// Triggered every time a client successfully connects
io.on('connection',(socket)=>{
  

  // Listens for an "identity" event from the connected client, which should include a userId. When this event is received, it logs the userId to the console. This allows the server to associate the socket connection with a specific user.
  socket.on("identity",async (userId)=>{
    
    await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`,{userId,socketId:socket.id})
  })
// Listens for an "update-location" event from the client, which should include a userId, latitude, and longitude. When this event is received, it constructs a GeoJSON Point object with the provided coordinates and sends a POST request to the server's API endpoint to update the user's location in the database. This allows the server to keep track of the user's real-time location.
  socket.on("update-location",async ({userId,latitude,longitude})=>{

    const location={
      type:"Point",
      coordinates:[longitude,latitude]
    }
    await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`,{userId,location})

     io.emit("update-deliveryBoy-location",{userId,location})
  })

 

  socket.on('disconnect',()=>{
    console.log('user disconnected',socket.id);
  
})
})

// Defines an HTTP POST endpoint at /notify that accepts a JSON payload containing a socketId, event name, and data. If a socketId is provided, it emits the specified event with the data to that specific socket. If no socketId is provided, it broadcasts the event to all connected clients. This allows external services or parts of the application to trigger real-time events on the clients via HTTP requests.
app.post('/notify',(req,res)=>{
  const {event,data,socketId}=req.body;
  if(socketId){
    io.to(socketId).emit(event,data);
  }else{
    io.emit(event,data);
  }
  return res.status(200).json({"success":true});
})


server.listen(port,()=>{
  console.log(`server is running on port ${port}`);
})