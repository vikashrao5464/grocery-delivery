// Import database connection utility
import connectDb from "@/lib/db";
// Import email sending function
import { sendEmail } from "@/lib/mailer";
// Import order model
import Order from "@/models/order.model";
// Import Next.js server utilities
import { NextRequest, NextResponse } from "next/server";

// POST handler to send delivery OTP to customer
export async function POST(req:NextRequest){
try{
  // Connect to database
  await connectDb();
  // Parse orderId from request body
  const {orderId}=await req.json();
  // Find order by ID and populate user details
  const order=await Order.findById(orderId).populate("user");

  // Check if order exists
  if(!order){
    return NextResponse.json(
      {message:"order not found"},
      {status:400}
    ) 
  }

  // Generate a random 4-digit OTP
  const otp =Math.floor(1000+Math.random()*9000).toString();
  // Assign OTP to order
  order.deliveryOtp=otp;
  // Save order with OTP
  await order.save();

  // Send OTP to customer's email
  await sendEmail(order.user.email,
    "Your Delivery OTP",
    `<h2>Your Delivery OTP is <strong>${otp}</strong></h2>`
  )

  // Return success response
  return NextResponse.json(
    {message:"OTP sent to customer's email"},
    {status:200}
  )
}catch(error){
   // Handle errors
   console.error("Error sending OTP:", error);
   return NextResponse.json(
    {message:"Error sending OTP",error: error instanceof Error ? error.message : "Unknown error"},
    {status:500}
   )
}
}