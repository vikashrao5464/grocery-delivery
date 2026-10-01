import connectDb from "@/lib/db";
import User from "@/models/user.model";

import { NextResponse } from "next/server";
import { isInternalSocketRequest } from "@/lib/socketSecurity";

export async function POST(req:Request){
  try{
   if(!isInternalSocketRequest(req)){
    return NextResponse.json({message:"Unauthorized"},{status:401})
   }
   await connectDb();
   const {userId,location} =await req.json();
   if(!userId || !location){
    return NextResponse.json({message:"missing userId or location"},{status:400})
   }

   const user=await User.findByIdAndUpdate(userId,{location});
   if(!user){
    return NextResponse.json({message:"user not found"},{status:400})
   }

   return NextResponse.json({message:"location updated"},{status:200})
   
  }catch{
    return NextResponse.json({message:"Interval Server Error"},{status:500})
  }
}
