// api for fetching current order assigned to the delivery boy and its details and reflect it on delivery boy dashboard

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(){
  try{
    await connectDb();
    const session=await auth();
    const deliveryBoyId=session?.user?.id;
    
    // Find the active delivery assignment for this delivery boy
    // - Only assignments with status "assigned" (accepted but not yet completed)
    // - Populate the order field to get full order details including customer info, items, address
    // - .lean() converts Mongoose document to plain JS object for better performance
    const activeAssignment=await DeliveryAssignment.findOne({
      assignedTo:deliveryBoyId,
      status:"assigned"
    }).populate(
      {
      path:"order",
      populate:{path:"address"}
    }
    ).lean();

     if(!activeAssignment){
      return NextResponse.json(
        {active:false},
        {status:200}

        
      )
     }

     return NextResponse.json(
      {active:true,assignment:activeAssignment},
      {status:200}
     )
    

  }catch(error){
    console.error("Error fetching current order:", error);
    return NextResponse.json(
      {error:`Failed to fetch current order ${error}`},
      {status:500}
    )
  }
}