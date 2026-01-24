'use client'
import { Apple, Baby, Box, ChevronLeft, ChevronRight, Coffee, Cookie, Flame, Heart, Home, Milk, Wheat } from 'lucide-react'
import {motion} from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
// CategorySlider Component
const CategorySlider = () => {
  // Category data with icons and colors
  const categories=[
       {id:1, name: "Fruits and Vegetables",icon:Apple,color:"bg-green-100"},
      {id:2, name: "Dairy and Eggs",icon:Milk,color:"bg-yellow-100"},
      {id:3, name: "Rice,Atta and Grains" ,icon:Wheat,color:"bg-orange-100"},
      {id:4, name: "Snacks and Biscuits",icon:Cookie,color:"bg-pink-100"},
      {id:5, name: "Spices and Masalas",icon:Flame,color:"bg-red-100"},
      {id:6, name: "Beverages and Drinks",icon:Coffee,color:"bg-blue-100"},
      {id:7, name: "Personal Care",icon:Heart,color:"bg-purple-100"},
      {id:8, name: "HouseHold Supplies",icon:Home,color:"bg-lime-100"},
      {id:9, name: "Instant and Packed Foods",icon:Box,color:"bg-teal-100"},
      {id:10, name: "Baby and Pet Care",icon:Baby,color:"bg-rose-100"},
      ]
      // State to manage visibility of scroll buttons
      
      const [showLeft, setShowLeft]=useState<Boolean>();
       const [showRight, setShowRight]=useState<Boolean>();

// Reference to the scrollable container div
      const scrollRef=useRef<HTMLDivElement>(null)
 
      // Function to handle scrolling
      const scroll=(direction:"left" | "right")=>{
      if(!scrollRef.current) return
      const scrollAmount=direction==="left"?-300 :300;
      scrollRef.current.scrollBy({left:scrollAmount,behavior:"smooth"});
      }

      // Function to check scroll position and update button visibility
      const checkScroll=()=>{
        if(!scrollRef.current) return;
        const {scrollLeft,scrollWidth,clientWidth}=scrollRef.current;

        setShowLeft(scrollLeft > 0);
        setShowRight((scrollLeft + clientWidth )<= scrollWidth-5);
      }


      // Auto-scroll effect
      useEffect(()=>{
       const autoScroll = setInterval(()=>{
          if(!scrollRef.current) return;
          const {scrollLeft,scrollWidth,clientWidth}=scrollRef.current;
          if(scrollLeft + clientWidth >= scrollWidth-5){
           scrollRef.current.scrollTo({left:0,behavior:"smooth"})
          }else{
            scrollRef.current.scrollBy({left:300,behavior:"smooth"})
          }
        },4000)
        return()=>clearInterval(autoScroll);
      },[])

// Effect to add scroll event listener
      useEffect(()=>{
        // Add scroll event listener
        scrollRef.current?.addEventListener("scroll",checkScroll)
        // Initial check
        checkScroll();
        return()=>removeEventListener("scroll",checkScroll)
      },[])
  return (
    <motion.div
    className='w-[90%] md:w-[80%] mx-auto mt-10 relative'
    initial={{opacity:0,y:50}}
    whileInView={{opacity:1,y:0}}
    transition={{duration:0.5}}
    viewport={{once:false,amount:0.5}}
    >
      
   <h2 className='text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center'>🛒Shop By Category</h2>

   {/* Scroll Left Button */}
   {showLeft && <button className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-green-100 rounded-full w-10 h-10 flex items-center justify-center transition-all ' onClick={() => scroll("left")}><ChevronLeft className='w-6 h-6 text-green-700 ' /></button> }
   

   {/* Categories Container */}
   <div className='flex gap-6 overflow-x-auto px-10 pb-4 scrollbar-hide scroll-smooth' ref={scrollRef}>
    {categories.map((cat)=>{
      const Icon=cat.icon;
      return (
        <motion.div
          key={cat.id}
        className={`min-w-[150px] md:min-w-[180px] flex flex-col items-center justify-center rounded-2xl ${cat.color} shadow:md hover:shadow-lg transition-all cursor-pointer`}
        >
         <div className='flex flex-col items-center justify-center p-5'>
          <Icon className='w-10 h-10 text-green-700 mb-3'/>
          <p className='text-center text-sm md:text-base font-semibold text-gray-700 '>{cat.name}</p>
         </div>
        </motion.div>
      )
    })}
   </div>

   {/* Scroll Right Button */}
   {showRight && <button className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-green-100 rounded-full w-10 h-10 flex items-center justify-center transition-all' onClick={() => scroll("right")}><ChevronRight className='w-6 h-6 text-green-700 ' /></button>}
    
    </motion.div>
  )
}

export default CategorySlider
