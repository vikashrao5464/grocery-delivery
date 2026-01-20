import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req:NextRequest){
   const {pathname}=req.nextUrl;
  //  console.log("Proxy middleware triggered for path:",pathname);
   const publicRoutes=["/login","/register","/api/auth","/favicon.ico","/_next"]
   if(publicRoutes.some(path=>pathname.startsWith(path))){
    return NextResponse.next();
}

const token=await getToken({req,secret:process.env.AUTH_SECRET});
// console.log("Token in proxy:",token);
if(!token){
  // Redirect to login
  // append login to the current url
  const loginUrl=new URL("/login",req.url);
  // console.log("Redirecting to login:",loginUrl);
  loginUrl.searchParams.set("callbackUrl",req.url);
  // console.log(loginUrl)
  return NextResponse.redirect(loginUrl);
}

const role = token.role as string;

if(pathname.startsWith("/admin") && role !== "admin"){
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}
if(pathname.startsWith("/deliveryBoy") && role !== "deliveryBoy"){
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