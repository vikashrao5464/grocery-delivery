'use client'
import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { IUser } from '@/models/user.model';
import mongoose, { set } from 'mongoose';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import LiveMap from '@/components/LiveMap';
import { getSocket } from '@/lib/socket';

interface ILocation{
  latitude:number,
  longitude:number
}

interface IOrder{
  _id:mongoose.Types.ObjectId,
  user:mongoose.Types.ObjectId,
  isPaid:boolean,
  items:[
    {
      grocery:mongoose.Types.ObjectId,
      name:string,
      price:string,
      unit:string,
      image:string,
      quantity:number,
    }
  ]
  totalAmount:number,
  paymentMethod:"cod" | "online",
  address:{
    fullName:string,
    mobile:string,
    city:string,
    state:string,
    pincode:string,
    fullAddress:string,
    latitude:number,
    longitude:number,
  },
  assignment:mongoose.Types.ObjectId,
  assignedDeliveryBoy?:IUser,
  status:"pending" | "out of delivery" | "delivered",
  createdAt?:Date,
  updatedAt?:Date
}


function TrackOrder() {
  const {userData}=useSelector((state:any)=>state.user)
  const params = useParams();
  const orderId = params.orderId as string;
  const router=useRouter();

  const [order,setOrder]=React.useState<IOrder>();

   const [userLocation,setUserLocation]=useState<ILocation>({
    latitude:0,
    longitude:0
  });
    
    const [deliveryBoyLocation,setDeliveryBoyLocation]=useState<ILocation>({
    latitude:0,
    longitude:0
  });

  useEffect(()=>{
    const getOrder=async()=>{

    // calling api to get order details by id
    try{
    const result=await axios.get(`/api/user/get-order/${orderId}`)
    // console.log("order by id",result.data)
    setOrder(result.data.order);
    setUserLocation({
      latitude:result.data.order.address.latitude,
      longitude:result.data.order.address.longitude
    })

    setDeliveryBoyLocation({
      latitude:result.data.order.assignedDeliveryBoy.location.coordinates[1],
      longitude:result.data.order.assignedDeliveryBoy.location.coordinates[0]
    })
    }catch(error){
      console.log("get order by id error",error)
    }
  }
  getOrder();
  },[userData?._id])


  // socket io to listen for delivery boy location updates and update the delivery boy location state in real time
  useEffect(():any=>{
    const socket=getSocket();
    socket.on("update-deliveryBoy-location",({userId,location})=>{
      if(userId.toString()===order?.assignedDeliveryBoy?._id.toString()){
        setDeliveryBoyLocation({
          latitude:location.coordinates[1],
          longitude:location.coordinates[0]
        })
      }
    })
    return ()=>{socket.off("update-deliveryBoy-location")}
  },[order])
  return (
   <div className='w-full min-h-screen bg-linear-to-b from-green-50 to-white '>
   <div className='max-w-2xl mx-auto pb-24'>

    <div className='sticky top-0 bg-white/80 backdrop-blur-xl p-4 border-b shadow flex gap-3 items-center z-999'>
      <button className='p-2 bg-green-100 rounded-full ' onClick={()=>router.back()}><ArrowLeft className='text-green-700' size={20}/></button>
      <div>
        <h2 className='text-xl font-bold '>Track Order</h2>
        <p className='text-sm text-gray-600'>Order#{order?._id?.toString().slice(-6)} 
          <span className='text-green-700 font-semibold'>
          {order?.status}</span></p>
      </div>
      </div>

      {/* map */}
      <div className='px-4 mt-6'>
       <div className='rounded-3xl overflow-hidden border shadow '>
         <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation}/>
       </div>
      </div>
   </div>
   </div>
  )
}

export default TrackOrder