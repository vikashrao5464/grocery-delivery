// API for accepting or rejecting a delivery assignment by delivery boy

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/delivery/assignment/[id]/accept-assignment
 * Allows a delivery boy to accept a broadcasted delivery assignment
 * 
 * Steps:
 * 1. Verify delivery boy is authenticated
 * 2. Check assignment exists and is still "broadcasted"
 * 3. Ensure delivery boy is not already on another active assignment
 * 4. Assign the order to this delivery boy
 * 5. Update order with assigned delivery boy
 * 6. Remove this delivery boy from other broadcasted assignments
 */
export async function GET(req:NextRequest,{params}:{params:{id:string}}){


  try{
    // Connect to database
    await connectDb();
    
    // Fetch the assignment details using the id from params and return it to the client, it is assignment id
    const {id}=await params;
    const session=await auth();
    const deliveryBoyId=session?.user?.id;

    // Check if delivery boy is authenticated
    if(!deliveryBoyId){
      return NextResponse.json({message:"Unauthorized"},{status:401})
    }
    
    // Find the assignment and make sure it is broadcasted to the delivery boy
    const assignment=await DeliveryAssignment.findById(id)

    if(!assignment){
      return NextResponse.json({message:"Assignment not found"},{status:404 })
    }

    // Check if assignment is still available (not already accepted by someone else)
    if(assignment.status!=="broadcasted"){
      return NextResponse.json({message:"assignment expired"},{status:400})
    }

    // Check if delivery boy is already busy with another assignment
    const alreadyAssigned=await DeliveryAssignment.findOne({
      assignedTo:deliveryBoyId,
      status:{$nin:["broadcasted","completed"]}
    })

    if(alreadyAssigned){
      return NextResponse.json({message:"already assigned to another order"},{status:400})
    }

   // Assign this delivery boy to the assignment
   assignment.assignedTo=deliveryBoyId;
   assignment.status="assigned";
   assignment.acceptedAt=new Date();
    await assignment.save();

  
  // Update the order with the assigned delivery boy
  const order=await Order.findOne(assignment.order);
  if(!order){
    return NextResponse.json({message:"order not found"},{status:404})
  }

  order.assignedDeliveryBoy=deliveryBoyId;
  await order.save();


  // Remove this delivery boy from all other broadcasted assignments
  // Since they're now busy with this order
  await DeliveryAssignment.updateMany(
    {_id:{$ne:assignment._id},
    broadcastedTo:deliveryBoyId,
    status:"broadcasted"
  },
  {
    $pull:{broadcastedTo:deliveryBoyId}
  }
  )

  return NextResponse.json({message:"assignment accepted successfully"},{status:200})
  }catch(error){
    return NextResponse.json({message:"error in accepting assignment "+error},{status:500})
  }
}