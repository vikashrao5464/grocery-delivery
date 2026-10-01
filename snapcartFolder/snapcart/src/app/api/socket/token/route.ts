import { auth } from "@/auth";
import { createSocketToken } from "@/lib/socketSecurity";
import { NextResponse } from "next/server";

export async function GET(){
  const session=await auth();
  if(!session?.user?.id){
    return NextResponse.json({message:"Unauthorized"},{status:401});
  }
  return NextResponse.json({token:createSocketToken(session.user.id)});
}
