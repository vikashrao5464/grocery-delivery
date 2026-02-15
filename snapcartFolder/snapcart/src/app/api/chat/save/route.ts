// Import database connection utility
import connectDb from "@/lib/db";
// Import Message model for saving chat messages
import Message from "@/models/message.model";
// Import Order model for validating order existence
import Order from "@/models/order.model";


import { NextRequest, NextResponse } from "next/server";

// API endpoint to save a chat message for a specific order
export async function POST(req:NextRequest){
  try{
    // Establish connection to MongoDB
    await connectDb();
    // Extract message details from request body
    const {senderId,text,roomId,time}=await req.json();
    // Verify that the order exists (order ID is used as room ID for chat)
    const room=await Order.findById(roomId);
    // Return error if order not found
    if(!room){
      return NextResponse.json(
        {message:"room not found"},
        {status:400}
      )
    }

    // Create and save the new message in the database
    const message=await Message.create({senderId,text,roomId,time})

    // Return the created message as response
    return NextResponse.json(
      message,{status:200}
    )
  }catch(error){
    // Handle any errors during message saving
    return NextResponse.json(
      {message:`save message error: ${error}`},
      {status:500}
    )
  }
}