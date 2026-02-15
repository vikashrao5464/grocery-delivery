'use client'
import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { IUser } from '@/models/user.model';
import mongoose, { set } from 'mongoose';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send } from 'lucide-react';
import LiveMap from '@/components/LiveMap';
import { getSocket } from '@/lib/socket';
import { motion, AnimatePresence } from 'motion/react';
import { IMessage } from '@/models/message.model';

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

  const [newMessage,setNewMessage]=useState("");
  const [messages,setMessages]=useState<IMessage[]>([]);

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


  // Join Socket.IO room for this order to receive real-time messages
  useEffect(() => {
    const socket = getSocket(); 
    socket.emit("join-room", orderId);

    // Listen for incoming messages
    socket.on("send-message",(message)=>{
      if(message.roomId==orderId){
        setMessages((prev)=>([...prev,message]))
      }
    })

    return () => {
      socket.off("send-message");
    }
  },[orderId])


  // Function to send a new chat message
  const sendMSg = () => {
    // Get socket instance
    const socket = getSocket();
    // Create message object with all required fields
    const message = {
      roomId: orderId,
      text: newMessage,
      senderId: userData?._id,
      time: new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
       
      })
    }
    // Emit message to socket server
    socket.emit("send-message", message)
    // Clear input field
    setNewMessage("");
  }


  // Fetch all previous messages for this order on component mount
  useEffect(()=>{
    const getAllMessages=async()=>{
      try{
        // Call API to get all messages for this order
        const result=await axios.post('/api/chat/messages',{roomId:orderId})
        // Set messages state with fetched data
        setMessages(result.data);
      }catch(error){
        console.log("error fetching messages for this order:",error)
      }
    }
    getAllMessages();
  },[orderId])
    


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
      <div className='px-4 mt-6 space-y-4'>
       <div className='rounded-3xl overflow-hidden border shadow '>
         <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation}/>
       </div>

       {/* Main chat container with fixed height and flex layout */}
   <div className='bg-white rounded-3xl shadow-lg border p-4 h-[430px] flex flex-col '>

    {/* Scrollable messages display area */}
    <div className='flex-1 overflow-y-auto p-2 space-y-3'>
      {/* AnimatePresence enables exit animations for messages */}
      <AnimatePresence>
        {/* Map through all messages and render each with animation */}
        {messages?.map((msg,index)=>(
          <motion.div
           key={msg._id?.toString()}
           // Fade in from bottom on mount
           initial={{opacity:0,y:15}}
           animate={{opacity:1,y:0}}
           exit={{opacity:0}}
           transition={{duration:0.2}}
           // Align message to right if sent by delivery boy, left if from customer
           className={`flex ${msg.senderId==userData?._id?"justify-end":"justify-start"}`}
           >
            {/* Message bubble with sender-specific styling */}
            <div className={`px-4 p-2 max-w-[75%] rounded-2xl shadow ${msg.senderId==userData?._id? "bg-green-600 text-white rounded-br-none"
             :"bg-gray-100 text-gray-800 rounded-bl-none"

            }`}>
              {/* Message text content */}
              <p>{msg.text}</p>
              {/* Message timestamp */}
              <p className='text-[10px] opacity-70 mt-1 text-right' >{msg.time}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>


       {/* Chat input section with text field and send button */}
      <div className='flex gap-2 mt-3 border-t pt-3'>
        {/* Message input field */}
        <input type="text" placeholder='Type a Message...' className='flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500' value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        {/* Send message button */}
        <button className='bg-green-600 hover:bg-green-700 p-3 rounded-xl text-white' onClick={sendMSg}><Send size={20} /></button>
      </div>
    </div>
      </div>
   </div>
   </div>
  )
}

export default TrackOrder