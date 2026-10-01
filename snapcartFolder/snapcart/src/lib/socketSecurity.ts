import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

const LOCAL_SOCKET_SECRET="snapcart-local-development-only";

const getSecret=()=>{
  const secret=process.env.SOCKET_INTERNAL_SECRET;
  if(secret) return secret;
  if(process.env.NODE_ENV!=="production") return LOCAL_SOCKET_SECRET;
  throw new Error("SOCKET_INTERNAL_SECRET is not configured");
};

export function createSocketToken(userId:string){
  const payload=Buffer.from(JSON.stringify({userId,exp:Date.now()+5*60*1000})).toString("base64url");
  const signature=createHmac("sha256",getSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isInternalSocketRequest(req:NextRequest | Request){
  const supplied=req.headers.get("x-socket-secret") || "";
  const expected=getSecret();
  const suppliedBuffer=Buffer.from(supplied);
  const expectedBuffer=Buffer.from(expected);
  return suppliedBuffer.length===expectedBuffer.length && timingSafeEqual(suppliedBuffer,expectedBuffer);
}
