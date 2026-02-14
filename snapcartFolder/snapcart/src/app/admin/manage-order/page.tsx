'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { IOrder } from '@/models/order.model';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AdminOrderCard from '@/components/AdminOrderCard';
import { getSocket } from '@/lib/socket';


function ManageOrders() {

  const router=useRouter();
  // state to hold orders
  const [orders,setOrders]=useState<IOrder[]>();

  // fetch orders api call
  useEffect(()=>{
    const getOrders=async()=>{
      try{
        const result =await axios.get("/api/admin/get-orders")
        // console.log(result.data);
        setOrders(result.data);
      }catch(error){

      }
    }
    getOrders();
  },[])

// socket io for real time updates , it receives a socket event from the socket server whenever a new order is placed and updates the orders state to include the new order, which in turn updates the UI in real time without needing a page refresh.
  useEffect(():any=>{
   const socket=getSocket();
   socket?.on("new-order",(newOrder)=>{
    setOrders((prev)=>[newOrder,...prev!])
   })
  return ()=>{socket?.off("new-order")}
  },[])
  return (
    <div className='min-h-screen bg-gray-50 w-full'>

      {/* fixed header */}
     <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
        <div className='max-w-3xl mx-auto flex items-center gap-4 px-4 py-3'>
          <button onClick={() => router.push('/')} className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition'>
            <ArrowLeft size={24} className='text-green-700'/>
          </button>
          <h1 className='text-xl font-bold text-gray-800'>Manage Orders</h1>
        </div>
        </div>

    <div className='max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8'>
      {/* orders mapping */}
      <div className='space-y-6'>
      {orders?.map((order,index)=>(
        <AdminOrderCard key={order._id?.toString()} order={order}/>
      ))}
    </div>
    </div>
    
    </div>
  )
}

export default ManageOrders