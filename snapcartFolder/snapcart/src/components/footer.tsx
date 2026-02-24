"use client";
import React from 'react'
import { motion } from "framer-motion";
import Link from 'next/link';
import { Facebook, Github, InstagramIcon, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';


function Footer() {
  return (
   <motion.div
   initial={{opacity:0,y:40}}
  whileInView={{opacity:1,y:0}}
  viewport={{once:true,amount:0.3}}
  transition={{duration:0.6,ease:"easeOut"}}
  className='bg-linear-to-r bg-green-900 text-white mt-20'
   >
  <div className='w-[90%] mx-auto py-10 flex justify-between flex-wrap gap-10 border-b border-green-500/40'>
    <div>
      <h2 className='text-2xl font-bold mb-3 text-black'>SnapCart</h2>
      {/* <p>Your one-stop shop for all grocery needs.</p> */}
      <p>SnapCart makes grocery shopping easy, fast, and reliable.<br/>Order online and get your groceries delivered to your doorstep.</p>
    </div>

    <div>
      <h2 className='text-xl font-semibold mb-3'>Quick Links</h2>
      <ul className='space-y-2 font-semibold mb-3'>
      <li><Link href={"/"} className='hover:text-white transition'>Home</Link></li>
      <li><Link href={"/user/cart"} className='hover:text-white transition'>Cart</Link></li>
      <li><Link href={"/user/my-orders"} className='hover:text-white transition'>My Orders</Link></li>
      </ul>
    </div>

    <div >
    <h3 className='text-xl font-semibold mb-3 '>Contact Us</h3>
    <ul className='space-y-2 text-green-100 text-sm'>

      <li className='flex items-center gap-2 '>
        <MapPin size={16}/> sonepat,Haryana
      </li>
      <li className='flex items-center gap-2 '>
        <Phone size={16}/> +91 9588793351
      </li>
      <li className='flex items-center gap-2 '>
        <Mail size={16}/> snapcart749@gmail.com
      </li>
    </ul>

    {/* socila links */}
    <div className='flex gap-4 mt-4'>
      <Link href={"https://github.com/vikashrao5464"} target='_blank'>
      <Github size={20} className='hover:text-white transition'/>
      </Link>
      <Link href={""} target='_blank'>
      <InstagramIcon size={20} className='hover:text-white transition'/>
      </Link>
      <Link href={"https://www.linkedin.com/in/vikash-rao-1a837828b"} target='_blank'>
    <Linkedin size={20} className='hover:text-white transition'/>
      </Link>
    </div>
    </div>

 </div>

 <div className='text-center py-4 text-sm text-green-100 bg-green-800/40'>
 {new Date().getFullYear()} <span className='font-semibold'>SnapCart</span> © SnapCart. All rights reserved.
 </div>
   </motion.div>
  )
}

export default Footer