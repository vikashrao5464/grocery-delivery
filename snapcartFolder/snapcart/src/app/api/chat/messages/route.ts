// Import database connection utility
import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
// Import Order model for validating order existence
import Order from "@/models/order.model";

// Import Message model for retrieving chat messages
import Message from "@/models/message.model";

// API endpoint to fetch all messages for a specific order
export async function POST(req:NextRequest){
try{
  // Establish connection to MongoDB
  await connectDb();
  // Extract order ID from request body (used as room ID for chat)
  const {roomId}=await req.json();
  // Verify the order exists in the database
  let room=await Order.findById(roomId);
  // Return error if order not found
  if(!room){
    return NextResponse.json(
      {message:"room not found"},
      {status:400}
    )
  }

  // Retrieve all messages belonging to this order
  const messages=await Message.find({roomId:room._id})

  // Return the messages array as response
  return NextResponse.json(
    messages,{status:200}
  )

}catch(error){
  // Handle any errors during message retrieval
  return NextResponse.json(
    {message:`get messages error: ${error}`},
    {status:500}
  )
}
}