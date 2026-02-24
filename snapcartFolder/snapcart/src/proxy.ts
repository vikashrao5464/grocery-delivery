
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export async function proxy(req:NextRequest){
   const {pathname}=req.nextUrl;
  //  console.log("Proxy middleware triggered for path:",pathname);
   
   // Public routes that don't require authentication
   // IMPORTANT: Stripe webhook routes must be public for Stripe to call them
   const publicRoutes=[
     "/login",
     "/register",
     "/api/auth",
     "/api/socket/connect", 
     "/api/socket/update-location",       // Socket.IO server needs to call this
     "/api/chat/save",                    // Socket.IO server saves chat messages
     "/api/user/stripe/webhook",   // Old webhook path - also must be public
     "/favicon.ico",
     "/_next"
   ]
   if(publicRoutes.some(path=>pathname.startsWith(path))){
    return NextResponse.next();
}

const session=await auth();
// console.log("Token in proxy:",token);
if(!session){
  // Redirect to login
  // append login to the current url
  const loginUrl=new URL("/login",req.url);
  // console.log("Redirecting to login:",loginUrl);
  loginUrl.searchParams.set("callbackUrl",req.url);
  // console.log(loginUrl)
  return NextResponse.redirect(loginUrl);
}

const role = session.user?.role;

if(pathname.startsWith("/admin") && role !== "admin"){
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}
if(pathname.startsWith("/delivery") && role !== "deliveryBoy"){
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}
if(pathname.startsWith("/user") && role !== "user"){
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

return NextResponse.next();
}
export const config={
  matcher:["/((?!api/auth|favicon.ico|_next/static|_next/image|assets|images).*)"]
}