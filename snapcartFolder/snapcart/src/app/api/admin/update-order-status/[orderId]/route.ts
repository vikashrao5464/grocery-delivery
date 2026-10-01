import connectDb from "@/lib/db";
import { emitEventHandler } from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req:NextRequest,context:{ params: Promise<{ orderId: string; }>; }){
  try{
    const session=await auth();
    if(session?.user?.role!=="admin"){
      return NextResponse.json({message:"Unauthorized"},{status:403});
    }
    await connectDb();
    const {orderId}=await context.params;
    const {status}=await req.json();
    if(!["pending","out of delivery","delivered"].includes(status)){
      return NextResponse.json({message:"Invalid order status"},{status:400});
    }
    
    console.log("Updating order:", orderId, "to status:", status);

    const order=await Order.findById(orderId).populate("user")
    if(!order){
      console.log("Order not found:", orderId);
      return NextResponse.json({message:"Order not found"},{status:404})
    }

    order.status=status;
    let deliveryBoysPayload:Array<{
      id:string;
      name:string;
      mobile?:string;
      latitude:number;
      longitude:number;
    }> = [];
    
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
        isOnline:true,
        "socketIds.0":{$exists:true},
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
       
        await order.save();
         await emitEventHandler("order-status-update",{orderId:order._id, status:order.status})
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
      await deliveryAssignment.populate("order");
      
      // emit new assignment event to available delivery
      for(const boyId of candidates){
        const boy=await User.findById(boyId);
        if(boy.socketIds?.length){
          await emitEventHandler(
            "new-assignment",
            deliveryAssignment,
            boy.socketIds)
        }
      }
      
      // link order with assignment
      order.assignment=deliveryAssignment._id;
      deliveryBoysPayload=availableDeliveryBoys.map(b=>({
         id:String(b._id),
         name:b.name,
         mobile:b.mobile,
        latitude:b.location.coordinates[1],
        longitude:b.location.coordinates[0],
      }))

      await deliveryAssignment.populate('order')

    }
    await order.save();
    await order.populate("user")
    
   await emitEventHandler("order-status-update",{orderId:order._id, status:order.status})

    return NextResponse.json({
    assignment:order.assignment?._id,
    availableBoys:deliveryBoysPayload 

    },{status:200})

  }catch(error){
  console.error("Error updating order status:", error);
  return NextResponse.json({message:`update order status error: ${error}`},{status:500})

  }
}
