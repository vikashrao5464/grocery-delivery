import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import { isInternalSocketRequest } from "@/lib/socketSecurity";

export async function POST(req:NextRequest){
 try{
 if(!isInternalSocketRequest(req)){
   return NextResponse.json({message:"Unauthorized"},{status:401})
 }
 await connectDb();
 const {userId,socketId}=await req.json();

 if(!userId || typeof userId!=="string" || !socketId || typeof socketId!=="string"){
   return NextResponse.json({message:"userId and socketId are required"},{status:400})
 }

 const user=await User.findByIdAndUpdate(userId,{
   $addToSet:{socketIds:socketId},
   $set:{isOnline:true}
 },{new:true})

if(!user){
  return NextResponse.json({message:"user not found"},{status:400})
}

return NextResponse.json({success:true},{status:200})
}catch{
return NextResponse.json({success:false},{status:500})
}

}
