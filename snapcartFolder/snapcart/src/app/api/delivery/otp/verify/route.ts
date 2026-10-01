// Import database connection utility
import connectDb from "@/lib/db";
import { emitEventHandler } from "@/lib/emitEventHandler";
// Import delivery assignment model
import DeliveryAssignment from "@/models/deliveryAssignment.model";
// Import order model
import Order from "@/models/order.model";
// Import Next.js server utilities
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// POST handler to verify delivery OTP
export async function POST(req:NextRequest){
 try{
   // Connect to database
   await connectDb();
   // Parse orderId and otp from request body
   const {orderId,otp}=await req.json();
   const session=await auth();

   if(!session?.user?.id || session.user.role!=="deliveryBoy"){
    return NextResponse.json({message:"Unauthorized"},{status:401});
   }
   
   // Validate required fields
   if(!orderId || !otp){
    return NextResponse.json(
      {message:"orderId and otp are required"},
      {status:400}
    )
   }

   // Find order by ID
   const order=await Order.findById(orderId);
   // Check if order exists
   if(!order){
    return NextResponse.json(
      {message:"order not found"},
      {status:400}
    )
   }

   if(!order.deliveryOtpExpiresAt || order.deliveryOtpExpiresAt.getTime()<=Date.now()){
    order.deliveryOtp=null;
    order.deliveryOtpExpiresAt=null;
    await order.save();
    return NextResponse.json(
      {message:"OTP has expired. Please resend a new OTP."},
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
    )
   }

   // Verify OTP matches
   if(order.deliveryOtp!==String(otp)){
    return NextResponse.json(
      {message:"Incorrect OTP"},
      {status:400}
    )
   }

   // Update order status to delivered
   order.status="delivered";
   // Mark OTP as verified
   order.deliveryOtpVerification=true;
   order.deliveryOtp=null;
   order.deliveryOtpExpiresAt=null;
   // Set delivery timestamp
   order.deliveredAt=new Date();
   // Save updated order
   await order.save();


   await emitEventHandler("order-status-update",{orderId:order._id, status:order.status})

   // Update delivery assignment to completed and unassign delivery person
   await DeliveryAssignment.findOneAndUpdate(
    {order:order._id},
    {$set:{assignedTo:null,status:"completed"}}
   )

   // Return success response
   return NextResponse.json(
    {message:"delivery successfully"},
    {status:200}
   )
 }catch(error){
    // Handle errors
    return NextResponse.json(
      {message:"Error verifying OTP",error},
      {status:500}
    )
 }
}
