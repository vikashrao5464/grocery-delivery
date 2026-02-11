'use client'
import React, { useState } from 'react'
import { IOrder } from '@/models/order.model';
import {motion} from 'motion/react';
import { ChevronDown, ChevronUp, CreditCard, MapPin, Package, Phone, User } from 'lucide-react';
import Image from 'next/image';

function AdminOrderCard({ order }: { order: IOrder }) {
  const statusOptions=["pending","out of delivery"]
  const [expanded, setExpanded] =useState(false);
  return (
 <motion.div
 key={order._id?.toString()}
 initial={{opacity:0,y:20}}
 animate={{opacity:1,y:0}}
 transition={{duration:0.4}}
 className='bg-white shadow-md hover:shadow-lg border border-gray-100 rounded-2xl p-6 transition-all'
 >
  <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4 '>
    <div className='space-y-1'>
      <p className='text-lg font-bold flex items-center gap-2 text-green-700'>
        <Package size={20}/>
        Order #{order._id?.toString().slice(-6)}
      </p>
      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${order.isPaid ?"bg-green-100 text-green-700 border-green-300":"bg-red-100 text-red-700 border-red-300"}`}>
        {order.isPaid ? "Paid":"UnPaid"}
      </span>

      <p className='text-gray-500 text-sm'>
        {new Date(order.createdAt!).toLocaleString()}
      </p>

      {/* user details */}
      <div className='mt-3 space-y-1 text-gray-700 text-sm'>
        <p className='flex items-center gap-2 font-semibold'>
          <User size={16} className='text-green-600'/>
          <span>{order?.address.fullName}</span>
        </p>
        <p className='flex items-center gap-2 font-semibold'>
          <Phone size={16} className='text-green-600'/>
          <span>{order?.address.mobile}</span>
        </p>

        <p className='flex items-center gap-2 font-semibold'>
          <MapPin size={16} className='text-green-600'/>
          <span>{order?.address.fullAddress}</span>
        </p>

       
      </div>
       <p className='mt-3 flex items-center gap-2 text-sm text-gray-700'>
          <CreditCard size={16} className='text-green-600'/>
          <span>{order.paymentMethod==="cod" ? "Cash on Delivery" : "Online Payment"}</span>
        </p>

    </div>

    <div className='flex flex-col items-start md:items-end gap-2'>
       <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize 
        ${order.status==="delivered"?"bg-green-100 text-green-700 " :
          order.status==="pending" ? "bg-yellow-100 text-yellow-700" :
         "bg-blue-100 text-blue-700"
        }`}>
        {order.status}
       </span>

       <select
         className='border border-gray-300 rounded-lg px-3 py-1 text-sm shadow-sm hover:border-green-400 transition focus:ring-2 focus:ring-green-500 outline-none relative z-10'
         name={`order-status-${order._id}`}
       >
         {statusOptions.map(st => (
           <option key={st} value={st}>{st.toUpperCase()}</option>
         ))}
       </select>
    </div>
  </div>


  <div className='border-t border-gray-200 pt-3 mt-3 '>
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

 </motion.div>
  )
}

export default AdminOrderCard