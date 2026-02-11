import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest,{params}:{params:{orderId:string}}){
  try{
    await connectDb();
    const {orderId}=await params;
    const {status}=await req.json();

    const order=await Order.findById(orderId).populate("user")
    if(!order){
      return NextResponse.json({message:"Order not found"},{status:404})
    }

    order.status=status;

  }catch(error){

  }
}