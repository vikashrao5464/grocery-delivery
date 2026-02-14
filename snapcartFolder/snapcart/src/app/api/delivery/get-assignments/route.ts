import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";

/**
 * GET /api/delivery/get-assignments
 * Fetches all delivery assignments for the currently logged-in delivery boy
 * 
 * Returns:
 * - Array of assignments where the delivery boy is in the broadcastedTo list
 * - Only assignments with status "broadcasted" (not yet accepted/completed)
 * - Each assignment includes populated order details (customer info, address, items)
 * 
 * Used by:
 * - DeliveryBoyDashboard component to display available assignments
 */
export async function GET(){
  try{
    // Connect to MongoDB database
    await connectDb();
    
    // Get the currently authenticated delivery boy's session
    const session=await auth();
    
    // Find all assignments where:
    // 1. This delivery boy's ID is in the broadcastedTo array
    // 2. Status is "broadcasted" (still available to accept)
    // 3. Populate the order field with full order details
    const assignments=await DeliveryAssignment.find({
      broadcastedTo:session?.user?.id,
      status:"broadcasted"

    }).populate("order")
    
    // Return the assignments array to the client
    return NextResponse.json(assignments,{status:200})
  }catch(error){
    // Handle any errors during the fetch operation
    return NextResponse.json({message:"error in fetching assignments "+error},{status:500})
  }
}