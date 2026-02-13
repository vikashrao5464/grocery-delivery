import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";

export async function GET(){
  try{
    await connectDb();
    const session=await auth();
    const assignments=await DeliveryAssignment.find({
      broadcastedTo:session?.user?.id,
      status:"broadcasted"

    }).populate("order")
    return NextResponse.json({assignments},{status:200})
  }catch(error){
    return NextResponse.json({message:"error in fetching assignments "+error},{status:500})
  }
}