import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest,{params}:{params:{orderId:string}}){
  try{
    await connectDb();
    const {orderId}=await params;
    const {status}=await req.json();
    
    console.log("Updating order:", orderId, "to status:", status);

    const order=await Order.findById(orderId).populate("user")
    if(!order){
      console.log("Order not found:", orderId);
      return NextResponse.json({message:"Order not found"},{status:404})
    }

    order.status=status;
    let deliveryBoysPayload:any[] = [];
    
    // Clear assignment if status is changed away from "out of delivery"
    if(status !== "out of delivery" && order.assignment){
      order.assignment = undefined;
    }
    
    // !order.assignment means that msg not broadcasted for delivery
    if(status==="out of delivery" &&  !order.assignment){
    
      const {latitude,longitude}=order.address;
      console.log("Finding delivery boys near:", {latitude, longitude});
      
      // find available delivery boys

      const nearByDeliveryBoys=await User.find({
        role:"deliveryBoy",
        location:{
          $near:{
            $geometry:{
              type:"Point",
              coordinates:[Number(longitude),Number(latitude)]
            },
            $maxDistance:10000 // 10km
          }
        }
      })
      
      console.log("Found nearby delivery boys:", nearByDeliveryBoys.length);


      const nearByIds=nearByDeliveryBoys.map((b)=>b._id)
      // find busy delivery
      const busyIds=await DeliveryAssignment.find({
        assignedTo:{$in:nearByIds},
        status:{$nin:["broadcasted","completed"]},

      }).distinct("assignedTo")
      // filter busy
      const busyIdSet=new Set(busyIds.map((b=>String(b))))
      // filter available
      const availableDeliveryBoys=nearByDeliveryBoys.filter((b)=>!busyIdSet.has(String(b._id)))

      // broadcast to available delivery
      const candidates=availableDeliveryBoys.map((b)=>b._id)

      if(candidates.length==0){
        console.log("No delivery boys available, but order status updated");
        await order.save();
        return NextResponse.json({
          message:"Order status updated but no delivery boys available",
          assignment:null,
          availableBoys:[]
        },{status:200})
      }

      // create delivery assignment
      const deliveryAssignment=new DeliveryAssignment({
        order:order._id,
        broadcastedTo:candidates,
        status:"broadcasted"
      })
      
      await deliveryAssignment.save();
      
      // link order with assignment
      order.assignment=deliveryAssignment._id;
      deliveryBoysPayload=availableDeliveryBoys.map(b=>({
         id:b._id,
         name:b.name,
         mobile:b.mobile,
        latitude:b.location.coordinates[1],
        longitude:b.location.coordinates[0],
      }))

      await deliveryAssignment.populate('order')

    }
    await order.save();
    await order.populate("user")
    
    console.log("Order updated successfully:", orderId);

    return NextResponse.json({
    assignment:order.assignment?._id,
    availableBoys:deliveryBoysPayload 

    },{status:200})

  }catch(error){
  console.error("Error updating order status:", error);
  return NextResponse.json({message:`update order status error: ${error}`},{status:500})

  }
}