import connectDb  from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
export async function POST(req:NextRequest){
  try{
   await connectDb();
   const {name,email,password}=await req.json();
   const existingUser=await User.findOne({email});
   if(existingUser){
    return NextResponse.json({message:"User with this email already exists"},{status:400})
   }

   if(password.length<6){
     return NextResponse.json({message:"Password must be atleast 6 character long"},{status:400})
   }

  //  password hashing
  const hashedPassword=await bcrypt.hash(password,10);
  const user=await User.create({
    name,email,password:hashedPassword
  })

  return NextResponse.json(
    user,
   {status:200}
    
  )
  }
  catch(error){
     return NextResponse.json({
      message:`register error :${error}`
     },{status:500})
  }

}