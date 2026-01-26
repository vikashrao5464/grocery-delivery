// api for getting logged in user details
import { auth } from '@/auth'
import connectDb from '@/lib/db';
import User from '@/models/user.model';
import { NextResponse } from 'next/server';
import React from 'react'

export async function GET(request:Request){

  try{
    await connectDb();
const session= await auth();
if(!session || !session.user){
  return NextResponse.json(
    {message:"user is not authenticated"},
    {status:400}
  )
}

const user=await User.findOne({email:session.user.email}).select("-password");
if(!user){
  return NextResponse.json(
    {message:"user not found"},
    {status:400}
  )
}

return NextResponse.json(
  user,
  {status:200}
)
  }catch(error){
return NextResponse.json(
  {message:`get me error ${error}`},
  {status:500}
)
  }
}
