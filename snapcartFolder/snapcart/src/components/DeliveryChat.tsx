import React, { useEffect, useState } from 'react'
import mongoose from 'mongoose'
import { Send } from 'lucide-react'
import { getSocket } from '@/lib/socket'
import { IMessage } from '@/models/message.model'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'

// Props interface for orderId and deliveryBoyId
type props = {
  orderId: mongoose.Types.ObjectId,
  deliveryBoyId: mongoose.Types.ObjectId
}

// DeliveryChat component for real-time messaging between delivery boy and customer
function DeliveryChat({ orderId, deliveryBoyId }: props) {
  // State to hold the new message being typed by the delivery boy
  const [newMessage, setNewMessage] = useState("");

  // State to hold all chat messages for this order
  const [messages,setMessages]=useState<IMessage[]>([]);

  // Join Socket.IO room for this order to receive real-time messages
  useEffect(() => {
    // Get socket instance
    const socket = getSocket(); 
    // Join the room identified by orderId
    socket.emit("join-room", orderId);

    // Listen for incoming messages
    socket.on("send-message",(message)=>{
      if(message.roomId==orderId){
        setMessages((prev)=>([...prev,message]))
      }
    })

    // Cleanup listener on unmount
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
      senderId: deliveryBoyId,
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
   // Main chat container with fixed height and flex layout
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
           className={`flex ${msg.senderId==deliveryBoyId?"justify-end":"justify-start"}`}
           >
            {/* Message bubble with sender-specific styling */}
            <div className={`px-4 p-2 max-w-[75%] rounded-2xl shadow ${msg.senderId==deliveryBoyId? "bg-green-600 text-white rounded-br-none"
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
  )
}

export default DeliveryChat