import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { auth } from "@/auth";

import Grocery from "@/models/grocery.model";

export async function POST(req:NextRequest){
  try{
  await connectDb();
  const session=await auth();
  if(session?.user?.role!=="admin"){
    return NextResponse.json(
      {message:"Unauthorized"},
      {status:400}
    )
  }

 const {groceryId}=await req.json();
  const grocery=await Grocery.findByIdAndDelete(groceryId)
  return NextResponse.json(
     grocery,
    {status:200}
    
  )
  }catch(error){
    return NextResponse.json(
      {message:`delete grocery error: ${error}`},
      {status:500}
    )

  }

  }
