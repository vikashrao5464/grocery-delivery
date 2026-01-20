'use client'
import { Leaf, ShoppingBasket, Smartphone, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { sub } from 'motion/react-client'
import React, { useEffect } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import img1 from '../../public/img 1.svg'
import img2 from '../../public/img 2.svg'

const HeroSection = () => {
  const slides=[
    
    {
     id:1,
     icon:<Leaf className="h-20 w-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg" />,
     title:"fresh Organic Groceries",
     subtitle:"Farm Fresh fruits ,vegetables and daily essentials delivered to your doorstep.",
     btnText:"Shop Now",
     bg:"https://media.istockphoto.com/id/453963935/photo/fruits-and-vegetables-at-city-market-in-riga.jpg?s=2048x2048&w=is&k=20&c=MxAsVm_ySAvC7gfF6c_Oez-e9ZeqqrTvkQ0q1APoc3w="

    },

    {
     id:2,
     icon:<Truck className="h-20 w-20 sm:w-28 sm:h-28 text-yellow-400 drop-shadow-lg" />,
     title:"Fast & reliable Delivery 🚚",
     subtitle:"Get your groceries delivered to your doorstep quickly and reliably with our efficient delivery service.",
     btnText:"Order Now",
     bg:"https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=1115&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

    },
    {
     id:3,
     icon:<Smartphone className="h-20 w-20 sm:w-28 sm:h-28 text-blue-400 drop-shadow-lg" />,
     title:"Shop Anytime,Anywhere 📱",
     subtitle:"Easy and seamless online grocery shopping experience.",
     btnText:"Get Started",
     bg:"https://images.unsplash.com/photo-1524895455388-cd977540cd4b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

    }

]
const [current,setCurrent]=useState(0);
useEffect(()=>{
  const timer=setInterval(()=>{
    setCurrent((prev)=>(prev+1)%slides.length);
  },4000);
  return ()=>clearInterval(timer);
},[])

  return (
    <div className='relative w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl'>
      <AnimatePresence mode='wait'>
      <motion.div
      key={current}
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{duration:0.8}}
      exit={{opacity:0}}
      className='absolute inset-0'
      >
      <Image 
      src={slides[current].bg}
      alt={slides[current].title}
      fill
      priority
      className='object-cover'
      />
      <div className='absolute inset-0 bg-black/50 backdrop-blur-[1px]'/>
      </motion.div>
      </AnimatePresence>

      <div className='absolute inset-0 flex items-center justify-center text-center text-white px-6 '>
        <motion.div
        initial={{opacity:0,y:30}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.8}}
        className='flex flex-col items-center justify-center gap-6 max-w-3xl'
        >
        < div className='bg-white/10 backdrop-blur-md p-6 rounded-full shadow-lg'>
        {slides[current].icon}
        </div>
        <h1 className='text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg '>{slides[current].title}</h1>
        <p className='text-lg sm:text-xl text-gray-200 max-w-2xl'>{slides[current].subtitle}</p>
        <motion.button
        whileHover={{scale:1.09}}
        whileTap={{scale:0.9}}
        transition={{duration:0.2}}
        className='mt-4 bg-white text-green-700 hover:bg-green-100 px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 '
        >
        <ShoppingBasket className='w-5 h-5'/>
        {slides[current].btnText}
        </motion.button>
        </motion.div>
      </div>

      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3'> 
       {slides.map((_,index)=>(
       <button
       key={index}
       className={`w-3 h-3 rounded-full transition-all ${index===current ? "bg-white w-6 " : "bg-white/50"}`}
       />
       ))}
      </div>
    </div>
  )
}

export default HeroSection
