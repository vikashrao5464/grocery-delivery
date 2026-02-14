'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getSocket } from '@/lib/socket';
import { del } from 'motion/react-client';

function DeliveryBoyDashboard() {


  const [assignments,setAssignments]=useState<any[]>([]);

  // fetch assigned orders for delivery boy
  useEffect(()=>{
    const fetchAssignments=async()=>{
      try{
        const result =await axios.get('/api/delivery/get-assignments');
        console.log("assignments:",result.data)
        setAssignments(result.data);
      }catch(error){
        console.log("error fetching assignments:",error)
      }
    }
    fetchAssignments()
  },[])


  // listen for real time assignment updates using socket io, whenever a new order is broadcasted for delivery
  useEffect(():any=>{
    const socket= getSocket();
    socket.on("new-assignment",(deliveryAssignment)=>{
      setAssignments((prev)=>[...prev,deliveryAssignment])
    })
    return ()=>{socket.off("new-assignment")} 
},[])
  return (

    // UI for delivery
    <div className='w-full min-h-screen bg-gray-50 p-4'>
    <div className='max-w-3xl mx-auto '>
      
      <h2 className='text-2xl font-bold mt-[120px] mb-[30px] '>Delivery Assignments</h2>
      {assignments.map(a=>(
        <div key={a._id} className='p-5 bg-white rounded-xl shadow mb-4 border'>
          <p><b>Order Id</b>#{a?.order._id.slice(-6)}</p>
          <p className='text-gray-600'>{a.order.address.fullAddress}</p>

          <div className='flex gap-3 mt-4'>
            <button className='flex-1 bg-green-600 text-white py-2 rounded-lg'>Accept</button>
            <button className='flex-1 bg-red-600 text-white py-2 rounded-lg'>Reject</button>
          </div>
        </div>
       
      ))}
    </div>
    </div>
  )
}

export default DeliveryBoyDashboard