'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

function DeliveryBoyDashboard() {


  const [assignments,setAssignments]=useState([]);

  // fetch assigned orders for delivery boy
  useEffect(()=>{
    const fetchAssignments=async()=>{
      try{
        const result =await axios.get('/api/delivery/get-assignments');
        setAssignments(result.data);
      }catch(error){
        console.log("error fetching assignments:",error)
      }
    }
    fetchAssignments()
  },[])
  return (
    <div className='w-full min-h-screen bg-gray-50 p-4'>
    <div className='max-w-3xl mx-auto '>
      <h2 className='text-2xl font-bold mb-4 '>Delivery Assignments</h2>
    </div>
    </div>
  )
}

export default DeliveryBoyDashboard