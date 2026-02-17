import React, { useEffect, useState } from 'react'
import mongoose, { set } from 'mongoose'
import { Loader, Send, Sparkle } from 'lucide-react'
import { getSocket } from '@/lib/socket'
import { IMessage } from '@/models/message.model'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'
import { s } from 'motion/react-client'

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
  const [messages, setMessages] = useState<IMessage[]>([]);

  // Reference to the chat box container for scrolling purposes
  const chatBoxRef = React.useRef<HTMLDivElement>(null);

  // State to hold AI-generated quick reply suggestions
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(false);

  // Join Socket.IO room for this order to receive real-time messages
  useEffect(() => {
    // Get socket instance
    const socket = getSocket();
    // Join the room identified by orderId
    socket.emit("join-room", orderId);

    // Listen for incoming messages
    socket.on("send-message", (message) => {
      if (message.roomId == orderId) {
        setMessages((prev) => ([...prev, message]))
      }
    })

    // Cleanup listener on unmount
    return () => {
      socket.off("send-message");
    }
  }, [orderId])

  // Function to send a new chat message
  const sendMSg = () => {
    // Get socket instance
    const socket = getSocket();
    // Create message object with all required fields
    const message = {
      roomId: orderId,
      text: newMessage,
      senderId: deliveryBoyId,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"

      })
    }
    // Emit message to socket server
    socket.emit("send-message", message)
    // Clear input field
    setNewMessage("");
  }

  // Scroll to bottom of chat box whenever messages change
  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth"
    })
  }, [messages])




  // Fetch all previous messages for this order on component mount
  useEffect(() => {
    const getAllMessages = async () => {
      try {
        // Call API to get all messages for this order
        const result = await axios.post('/api/chat/messages', { roomId: orderId })
        // Set messages state with fetched data
        setMessages(result.data);
      } catch (error) {
        console.log("error fetching messages for this order:", error)
      }
    }
    getAllMessages();
  }, [orderId])

  // api fetch to get ai-generated quick reply suggestions based on last user message
  const getSuggestion = async () => {
    setLoading(true);
    try {

      const lastMessage = messages?.filter(m => m.senderId !== deliveryBoyId)?.at(-1)
      const result = await axios.post("/api/chat/ai-suggestions", {
        message: lastMessage?.text,
        role:"delivery_boy"
      })
      console.log("suggestions:", result.data)

      setSuggestions(result.data)
      setLoading(false);
    } catch (error) {
      console.log("error fetching suggestion:", error)
      setLoading(false);
    }
  }

  return (
    // Main chat container with fixed height and flex layout
    <div className='bg-white rounded-3xl shadow-lg border p-4 h-[430px] flex flex-col '>

      {/* ai suggestion  */}
      <div className='flex justify-between items-center mb-3'>
        <span className='font-semibold text-gray-700 text-sm'>Quick Replies</span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          onClick={getSuggestion}
          className='px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer'
        >
          <Sparkle size={14} />
          {loading ? <Loader className='"w-5 h-5 animate-spin'/> : "AI suggest"}
    
        </motion.button>
      </div>

      {/* for suggestion showing */}
      <div className='flex gap-2 flex-wrap mb-3'>
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            whileTap={{ scale: 0.95 }}
            className='px-3 py-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded-full cursor-pointer'
            onClick={() => setNewMessage(s)}
          >
            {s}
          </motion.div>
        ))}

      </div>



      {/* Scrollable messages display area */}
      <div className='flex-1 overflow-y-auto p-2 space-y-3' ref={chatBoxRef}>
        {/* AnimatePresence enables exit animations for messages */}
        <AnimatePresence>
          {/* Map through all messages and render each with animation */}
          {messages?.map((msg, index) => (
            <motion.div
              key={msg._id?.toString()}
              // Fade in from bottom on mount
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              // Align message to right if sent by delivery boy, left if from customer
              className={`flex ${msg.senderId == deliveryBoyId ? "justify-end" : "justify-start"}`}
            >
              {/* Message bubble with sender-specific styling */}
              <div className={`px-4 p-2 max-w-[75%] rounded-2xl shadow ${msg.senderId == deliveryBoyId ? "bg-green-600 text-white rounded-br-none"
                : "bg-gray-100 text-gray-800 rounded-bl-none"

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