import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(){
  try{
     const session=await auth();
     if(session?.user?.role!=="admin"){
       return NextResponse.json({message:"Unauthorized"},{status:403});
     }
     await connectDb();
     const orders=await Order.find({}).populate("user").populate("assignedDeliveryBoy").sort({createdAt:-1});
     return NextResponse.json(
      orders,{status:200}
     )
  }catch(error){
     return NextResponse.json(
      {message:`get orders error: ${error}`},
      {status:500}
     )
  }
}
