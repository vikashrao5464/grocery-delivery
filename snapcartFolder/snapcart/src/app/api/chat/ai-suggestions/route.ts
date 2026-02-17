import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req:NextRequest){
try{
  connectDb();
  const {message,role}=await req.json();

  const prompt=`You are a professional delivery assistant chatbot.
  
  You will be Given:
  - role:either "user" or "delivery_boy"
  - last message:the last message sent in the conversation


   Your Task:
   👉 if role is "user" -> generate 3 short whatsapp-style reply suggestion that a user could send to the delivery boy.
    👉 if role is "delivery boy" -> generate 3 short whatsapp-style reply suggestion that a delivery boy could send to the user.

    Follow these rules:
    -Replies must match the context of the last message.
    -keep replies short ,human like(max 10 words).
    -use emojis natuarlly (max one per reply).
    -no generic replies like "okay",or "Thank You".
    -must be helpful ,respectful and relevant to delivery ,status,help or location.
    -No numbering ,No extra instructions,No extra text.
    -just return comma-separated reply suggestions.

    Return only three replies suggestion ,comma-separated.

    Role:${role}
    Last Message:${message}
  `
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
     "contents":[{
        "parts":[
          {
            "text":prompt
          }
        ]
      }]
    })
  })

  const data=await response.json();
  const replyText=data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const suggestions=replyText.split(",").map((s:string)=>s.trim()).filter((s:string)=>s.length>0)
  return NextResponse.json(
    suggestions,{status:200}
  )
}catch(error){
  console.error("Gemini error:", error);
  return NextResponse.json(
    [],{status:500}
  )
}

}