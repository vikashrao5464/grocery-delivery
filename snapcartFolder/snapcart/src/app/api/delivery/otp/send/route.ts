// Import database connection utility
import connectDb from "@/lib/db";
// Import email sending function
import { sendEmail } from "@/lib/mailer";
// Import order model
import Order from "@/models/order.model";
// Import Next.js server utilities
import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { auth } from "@/auth";
import DeliveryAssignment from "@/models/deliveryAssignment.model";

const OTP_EXPIRY_MINUTES=5;
const RESEND_COOLDOWN_SECONDS=30;

// POST handler to send delivery OTP to customer
export async function POST(req:NextRequest){
try{
  // Connect to database
  await connectDb();
  // Parse orderId from request body
  const {orderId}=await req.json();
  const session=await auth();

  if(!session?.user?.id || session.user.role!=="deliveryBoy"){
    return NextResponse.json({message:"Unauthorized"},{status:401});
  }

  // Find order by ID and populate user details
  const order=await Order.findById(orderId).populate("user");

  // Check if order exists
  if(!order){
    return NextResponse.json(
      {message:"order not found"},
      {status:400}
    ) 
  }

  const assignment=await DeliveryAssignment.findOne({
    order:order._id,
    assignedTo:session.user.id,
    status:"assigned"
  });

  if(!assignment){
    return NextResponse.json(
      {message:"This order is not assigned to you"},
      {status:403}
    );
  }

  if(order.deliveryOtpExpiresAt){
    const sentAt=order.deliveryOtpExpiresAt.getTime()-OTP_EXPIRY_MINUTES*60*1000;
    const retryAfter=RESEND_COOLDOWN_SECONDS*1000-(Date.now()-sentAt);
    if(retryAfter>0){
      return NextResponse.json(
        {message:`Please wait ${Math.ceil(retryAfter/1000)} seconds before resending OTP`},
        {status:429}
      );
    }
  }

  // Generate a random 4-digit OTP
  const otp=randomInt(1000,10000).toString();
  const expiresAt=new Date(Date.now()+OTP_EXPIRY_MINUTES*60*1000);
  // Assign OTP to order
  order.deliveryOtp=otp;
  order.deliveryOtpExpiresAt=expiresAt;
  order.deliveryOtpVerification=false;
  // Save order with OTP
  await order.save();

  // Send OTP to customer's email
  await sendEmail(order.user.email,
    "Your Delivery OTP",
    `<h2>Your Delivery OTP is <strong>${otp}</strong></h2><p>This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.</p>`
  )

  // Return success response
  return NextResponse.json(
    {message:"OTP sent to customer's email",expiresAt:expiresAt.toISOString()},
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
