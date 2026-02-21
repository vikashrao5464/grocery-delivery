'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getSocket } from '@/lib/socket';
import { del, div } from 'motion/react-client';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import DeliveryChat from './DeliveryChat';
import { set } from 'mongoose';
import { Loader } from 'lucide-react';

// Dynamically import LiveMap with SSR disabled (Leaflet requires window object)
const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false });

// Interface for location coordinates
interface ILocation{
  latitude:number,
  longitude:number
}

// Delivery boy dashboard component for managing delivery assignments and tracking orders
function DeliveryBoyDashboard() {

// State to hold delivery assignments for delivery boy
  const [assignments,setAssignments]=useState<any[]>([]);

  // Get logged-in delivery boy data from Redux store
  const {userData}=useSelector((state:any)=>state.user)
  // State to hold active order details for delivery
  const [activeOrder,setActiveOrder]=useState<any>(null);
  // Customer location coordinates
  const [userLocation,setUserLocation]=useState<ILocation>({
  latitude:0,
  longitude:0
});
  // Delivery boy location coordinates for real-time tracking
  const [deliveryBoyLocation,setDeliveryBoyLocation]=useState<ILocation>({
  latitude:0,
  longitude:0
});

// State to hold OTP input value for delivery verification
const [otp,setOtp]=useState("");
// State to control visibility of OTP verification box after delivery
const [showOtpBox,setShowOtpBox]=useState(false);

const [otpError,setOtpError]=useState("");
const [sendOtpLoading,setSendOtpLoading]=useState(false);
const [verifyOtpLoading,setVerifyOtpLoading]=useState(false);

  // Fetch all broadcasted delivery assignments for this delivery boy
  const fetchAssignments=async()=>{
      try{
        const result =await axios.get('/api/delivery/get-assignments');
        setAssignments(result.data);
      }catch(error){
        console.log("error fetching assignments:",error)
      }
    }

  // Track delivery boy's location in real-time and emit updates via Socket.IO
  useEffect(()=>{
    const socket= getSocket();
    if(!userData?._id) return;
    if(!navigator.geolocation) return;
    // Watch position continuously for real-time tracking
    const watcher=navigator.geolocation.watchPosition((pos)=>{
      const lat=pos.coords.latitude;
      const lon=pos.coords.longitude;
      // Update local state with delivery boy's current position
      setDeliveryBoyLocation({
        latitude:lat,
        longitude:lon
      })
      // Broadcast location update to server for live tracking
      socket.emit("update-location",{
        userId:userData._id,
        latitude:lat,
        longitude:lon
      })
    },(err)=>{
      console.log(err)
    },{enableHighAccuracy:true})
    // Clean up geolocation watcher on component unmount
    return()=>navigator.geolocation.clearWatch(watcher);
  },[userData?._id])
  


  // Accept a delivery assignment and update status
  const handleAccept=async(id:string)=>{
    try{
      const result=await axios.get(`/api/delivery/assignment/${id}/accept-assignment`);
      fetchCurrentOrder();
    }catch(error){
      console.log(error)
    }
  }


  // Listen for real-time new assignment broadcasts via Socket.IO
  useEffect(():any=>{
    const socket= getSocket();
    socket.on("new-assignment",(deliveryAssignment)=>{
      setAssignments((prev)=>[...prev,deliveryAssignment])
    })
    // Clean up socket listener on unmount
    return ()=>{socket.off("new-assignment")} 
  },[])

  // Fetch currently active order being delivered by this delivery boy
  const fetchCurrentOrder=async()=>{
    try{
      const result=await axios.get("/api/delivery/current-order")
      console.log("current order:",result.data)
      if(result.data.active){
        setActiveOrder(result.data.assignment)
        // Set customer location from order address
        setUserLocation({
          latitude:result.data.assignment.order.address.latitude,
          longitude:result.data.assignment.order.address.longitude,
        })
      }
    }catch(error){
      console.log(error)
    }
  }


  useEffect(():any=>{
    const socket=getSocket();
    socket.on("update-deliveryBoy-location",({userId,location})=>{
      
        setDeliveryBoyLocation({
          latitude:location.coordinates[1],
          longitude:location.coordinates[0]
        })
      
  })
  return ()=>{socket.off("update-deliveryBoy-location")}
  },[])

  // Load current order and assignments when component mounts
  useEffect(()=>{
    fetchCurrentOrder();
    fetchAssignments();
  },[userData])


  // Function to send OTP to customer for delivery verification after marking order as delivered
  const sendOtp=async()=>{
    setSendOtpLoading(true);
    try{
      
      const result=await axios.post('/api/delivery/otp/send',{orderId:activeOrder.order._id})
      setShowOtpBox(true);
      console.log(result.data)
      setSendOtpLoading(true);
    }catch(error){
      console.log("error sending OTP:",error)
      setSendOtpLoading(true);
    }
  }

  const verifyOtp=async()=>{
    setVerifyOtpLoading(true);
    try{
      const result=await axios.post('/api/delivery/otp/verify',{orderId:activeOrder.order._id,otp})
     
      console.log(result.data)
      // Remove completed assignment from list
      setAssignments((prev)=>prev.filter((a)=>a.order._id !== activeOrder.order._id))
      setActiveOrder(null);
      setShowOtpBox(false);
      setOtp("");
      await fetchCurrentOrder();
      setVerifyOtpLoading(false);
    }catch(error){
     setOtpError("OTP verification error")
     setVerifyOtpLoading(false);
    }
  }

  // Show live map with active delivery tracking if order is in progress
  if(activeOrder && userLocation){
    return (
      <div className='p-4 pt-[120px] min-h-screen bg-gray-50'>
        <div className='max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold text-green-700 mb-2 '>Active Delivery</h1>
          <p className='text-gray-600 text-sm mb-4 '>order#{activeOrder.order._id.slice(-6)}</p>
          {/* Live map showing delivery boy and customer locations */}
          <div className='rounded-xl border shadow-lg overflow-hidden mb-6'>
            <LiveMap
            userLocation={userLocation}
            deliveryBoyLocation={deliveryBoyLocation}
            />
          </div>
{/* chatboard */}
          <DeliveryChat orderId={activeOrder.order._id} deliveryBoyId={userData?._id!}/>

          
          <div className='mt-6 bg-white rounded-xl border shadow p-6 '>
            {/* mark as deliverd button */}
            {!activeOrder.order.deliveryOtpVerification && !showOtpBox &&
            (<button
            onClick={sendOtp}
            className='w-full py-4 bg-green-600 text-white shadow p-6 text-center'
            >{sendOtpLoading? <Loader size={16} className='animate-spin text-white'/>:"Mark as Delivered"}

            </button> )}

            {/* OTP verification box */}
            {showOtpBox && 
            <div className='mt-4'>
              <input type='text' className='w-full py-3 border rounded-lg text-center' placeholder='Enter OTP' maxLength={4} onChange={(e)=>setOtp(e.target.value)} value={otp}/>
              <button className='w-full mt-4 bg-blue-600 text-white text-center py-3 rounded-lg' onClick={verifyOtp}>{verifyOtpLoading? <Loader size={16} className='animate-spin text-white'/>:"Verify OTP"}</button>

              {otpError && <div className='text-red-600 mt-2 '>{otpError}</div>}
            </div>
              
              }

            {activeOrder.order.deliveryOtpVerification && <div className='text-green-700 text-center font-bold'>Delivery Completed!</div>}


            
          </div>


        </div>
      </div>
    )
  }



  // Show list of available assignments for delivery boy to accept or reject
  return (
    <div className='w-full min-h-screen bg-gray-50 p-4'>
      <div className='max-w-3xl mx-auto '>
        <h2 className='text-2xl font-bold mt-[120px] mb-[30px] '>Delivery Assignments</h2>
        {/* Map through all broadcasted assignments */}
        {assignments.map((a,index)=>(
          <div key={index} className='p-5 bg-white rounded-xl shadow mb-4 border'>
            <p><b>Order Id</b>#{a?.order._id.slice(-6)}</p>
            <p className='text-gray-600'>{a.order.address.fullAddress}</p>
            {/* Accept or reject buttons */}
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