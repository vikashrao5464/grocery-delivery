import { io, Socket } from "socket.io-client";

let socket:Socket | null=null;
export const getSocket=()=>{
  if(!socket){
    socket=io(process.env.NEXT_PUBLIC_SOCKET_SERVER,{
      auth:async (callback)=>{
        try{
          const response=await fetch("/api/socket/token");
          if(!response.ok) throw new Error("Unable to authenticate socket");
          callback(await response.json());
        }catch{
          callback({token:""});
        }
      }
    });
  }

  return socket;
}
