'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, CreditCard, MapPin, Package, Truck, TruckIcon, UserCheck } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { IUser } from '@/models/user.model';
import mongoose from 'mongoose';
import { useRouter } from 'next/navigation';

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


// component to display individual user order details

function UserOrderCard({ order }: { order: IOrder }) {

  const router=useRouter();

  const [expanded, setExpanded] = useState(false);

  const [status, setStatus] = useState(order.status);

  // function to get status color based on order status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "out of delivery":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "delivered":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  }
// socket io to listen for order status updates and update the status state of user order on user dashboard in real time
  useEffect(():any=>{
  const socket= getSocket();
  socket.on("order-status-update",(data)=>{
    if(data.orderId.toString()===order._id!.toString()){
      setStatus(data.status);
    }
  })
   return ()=>{socket.off("order-status-update")}
  },[])
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden'
    >
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-green-50 to-white'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800 '>order <span className='text-green-700 font-bold'>{order?._id?.toString().slice(-6)}</span></h3>

          <p className='text-xs text-gray-500 mt-1' >{new Date(order.createdAt!).toLocaleString()}</p>
        </div>
        <div className='flex flex-wrap items-center gap-2 '>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${order.isPaid ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>{order.isPaid ? "Paid" : "Unpaid"}</span>

          <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor(status)}`}>{status}</span>
        </div>
      </div>


      {/* div for showing payment method and address and items*/}
      <div className='p-5 space-y-4'>
        {/* payment method */}
        {order.paymentMethod === "cod" ? <div className='flex items-center gap-2 text-gray-700 text-sm'>
          <Truck size={16} className='text-green-600' />
          cash on delivery
        </div> : <div className='flex items-center gap-2 text-gray-700 text-sm'>
          <CreditCard size={16} className='text-green-600' />
          online payment
        </div>}


            {/* Display assigned delivery boy details if order has been assigned to a delivery person */}
        {order.assignedDeliveryBoy && 
        <>
        <div className='mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between'>
          <div className='flex items-center gap-3 text-sm text-gray-700'>
            <UserCheck size={18} className='text-blue-600'/>

            <div>
              <p>Assigned To: <span className='font-semibold'>{order.assignedDeliveryBoy.name}</span></p>
              <p className='text-xs text-gray-600'>📞 +91 {order.assignedDeliveryBoy.mobile}</p>
            </div>
          </div>


        <a href={`tel:${order.assignedDeliveryBoy.mobile}`} className='bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition'>
          Call
        </a>
          </div>
          
            {/* button for tracking ordr */}
         <button className='w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-xl shadow  hover:bg-green-700 transition' onClick={()=>router.push(`/user/track-order/${order._id?.toString()}`)}><TruckIcon size={18}/> Track Your Order</button>
        </>
          }

         

       
        {/* address */}
        <div className='flex items-center gap-2 text-gray-700 text-sm'>
          <MapPin size={16} className='text-green-600' />
          <span className='truncate'> {order.address.fullAddress}</span>

        </div>
        {/* items */}

        <div className='border-t border-gray-200 pt-3 '>
          <button
            onClick={() => setExpanded(prev => !prev)}
            className='w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-green-700 transition'
          >

            <span className='flex items-center gap-2'>
              <Package size={16} className='text-green-700 ' />
              {expanded ? "hide items" : `view ${order.items.length} items`}
            </span>
            {expanded ? <ChevronUp /> : <ChevronDown />}

          </button>

          <motion.div
          initial={{height:0,opacity:0}}
          animate={{
            height:expanded ? 'auto':0,
            opacity:expanded ?1:0
          }}
          transition={{duration:0.3}}
          >
            <div className='mt-3 space-y-3'>
              {order.items.map((item, index) => (
                <div 
                key={index}
                className='flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition'>
                  <div className='flex items-center gap-3'>
                     <Image src={item.image} alt={item.name} width={48} height={48} 
                     className="rounded-lg object-cover border border-gray-200" />

                     <div>
                      <p className='text-sm font-medium text-gray-800 '>{item.name}</p>
                      <p className='text-xs text-gray-500 '>{item.quantity} x {item.unit}</p>
                     </div>
                  </div>

                  <p className='text-sm font-semibold text-gray-800'>₹{Number(item.price)*item.quantity}</p>

                </div>
              ))}
            </div>

          </motion.div>
        </div>

{/* div for total and delivery status  */}
        <div className='border-t pt-3 flex justify-between items-center text-sm font-semibold text-gray-800'>

          <div className='flex items-center gap-2 text-gray-700 text-sm'>
            <Truck size={16} className='text-green-600'/>
            <span>Delivery:<span className='text-green-700 font-semibold'>{status}</span> </span>
          </div>
          <div>
            Total: <span className='text-green-700 font-bold'>₹{order.totalAmount}</span>
          </div>
        </div>

      </div>

    </motion.div>
  )
}

export default UserOrderCard
