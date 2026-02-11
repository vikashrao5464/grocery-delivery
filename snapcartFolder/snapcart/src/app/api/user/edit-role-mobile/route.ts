import connectDb from "@/lib/db";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req:NextRequest){
  try{
    await connectDb();
    const {role,mobile}=await req.json();
    const session=await auth();
    const user=await User.findOneAndUpdate({email:session?.user?.email},{role,mobile},{new:true});
    if(!user){
      return NextResponse.json({message:"user not found"},{status:404});
    }

    return NextResponse.json(
      user,
      {status:200}
    )


  }catch(error){
    return NextResponse.json({
      message:`edit role mobile error: ${error}`
    },
  {status:500})
  }
}