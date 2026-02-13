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

  socket.on("update-location",async ({userId,latitude,longitude})=>{

    const location={
      type:"Point",
      coordinates:[longitude,latitude]
    }
    await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`,{userId,location})
  })

  socket.on('disconnect',()=>{
    console.log('user disconnected',socket.id);
  
})
})


server.listen(port,()=>{
  console.log(`server is running on port ${port}`);
})