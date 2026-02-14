'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getSocket } from '@/lib/socket';
import { del } from 'motion/react-client';
import { useSelector } from 'react-redux';
import LiveMap from './LiveMap';


interface ILocation{
  latitude:number,
  longitude:number
}

function DeliveryBoyDashboard() {

// state to hold delivery assignments for delivery
  const [assignments,setAssignments]=useState<any[]>([]);

  const {userData}=useSelector((state:any)=>state.user)
// state to hold active order details for delivery
  const [activeOrder,setActiveOrder]=useState<any>(null);

  const [userLocation,setUserLocation]=useState<ILocation>({
  latitude:0,
  longitude:0
});
  
  const [deliveryBoyLocation,setDeliveryBoyLocation]=useState<ILocation>({
  latitude:0,
  longitude:0
});
  // deliveryLocation is of delivery boy and userLocation is of customer, both are used to track the delivery in real time on the map for delivery

  // fetch assigned orders for delivery boy
  const fetchAssignments=async()=>{
      try{
        const result =await axios.get('/api/delivery/get-assignments');
        // console.log("assignments:",result.data)
        setAssignments(result.data);
      }catch(error){
        console.log("error fetching assignments:",error)
      }
    }

// update location of delivery boy using geolocation api and emit the updated location to the server using socket io for real time tracking of
  useEffect(()=>{
    const socket= getSocket();
  if(!userData?._id) return;
  if(!navigator.geolocation) return;
  const watcher=navigator.geolocation.watchPosition((pos)=>{
    // Emit the updated location to the server 
    // watchposition is used to continuously track the user's location and update it in real-time as it changes, which is essential for features like live delivery tracking or location-based services.
    const lat=pos.coords.latitude;
    const lon=pos.coords.longitude;
    setDeliveryBoyLocation({
      latitude:lat,
      longitude:lon
    })

    socket.emit("update-location",{
      userId:userData._id,
      latitude:lat,
      longitude:lon
    })
  },(err)=>{
    console.log(err)
  },{enableHighAccuracy:true})

  // Clean up the watcher when the component unmounts


  return()=>navigator.geolocation.clearWatch(watcher);
  },[userData?._id])
  


//  handle accept assignment, it updates the delivery assignment status to accepted and assigns the delivery boy
  const handleAccept=async(id:string)=>{
    try{
      const result=await axios.get(`/api/delivery/assignment/${id}/accept-assignment`);
      console.log(result.data)
    }catch(error){
    console.log(error)
    }
  }


  // listen for real time assignment updates using socket io, whenever a new order is broadcasted for delivery
  useEffect(():any=>{
    const socket= getSocket();
    socket.on("new-assignment",(deliveryAssignment)=>{
      setAssignments((prev)=>[...prev,deliveryAssignment])
    })
    return ()=>{socket.off("new-assignment")} 
},[])


const fetchCurrentOrder=async()=>{
  try{
  const result=await axios.get("/api/delivery/current-order")
  console.log("current order:",result.data)
  if(result.data.active){
    setActiveOrder(result.data.assignment)
    setUserLocation({
      latitude:result.data.assignment.order.address.latitude,
      longitude:result.data.assignment.order.address.longitude,
    })
  }
  }catch(error){
 console.log(error)
  }
}

useEffect(()=>{
  fetchCurrentOrder();
  fetchAssignments();
},[userData])

// if there is an active order assigned to the delivery boy then show the order details and tracking on delivery dashboard
if(activeOrder && userLocation){
  return (
    <div className='p-4 pt-[120px] min-h-screen bg-gray-50'>
      <div className='max-w-3xl mx-auto'>
         <h1 className='text-2xl font-bold text-green-700 mb-2 '>Active Delivery</h1>
         <p className='text-gray-600 text-sm mb-4 '>order#{activeOrder.order._id.slice(-6)}</p>

         <div className='rounded-xl border shadow-lg overflow-hidden mb-6'>
          <LiveMap
          userLocation={userLocation}
          deliveryBoyLocation={deliveryBoyLocation}
          />
         </div>
      </div>
    </div>
  )
}



// if there is no active order assigned then show the list of assigned orders to accept or reject on delivery dashboard
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
            <button onClick={()=>handleAccept(a._id)} className='flex-1 bg-green-600 text-white py-2 rounded-lg'>Accept</button>
            <button className='flex-1 bg-red-600 text-white py-2 rounded-lg'>Reject</button>
          </div>
        </div>
       
      ))}
    </div>
    </div>
  )
}

export default DeliveryBoyDashboard