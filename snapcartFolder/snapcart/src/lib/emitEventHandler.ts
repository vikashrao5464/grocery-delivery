import axios from "axios";
export async function emitEventHandler(event:string,data:unknown,socketTargets?:string | string[]){
 
  try{
    const targetPayload=Array.isArray(socketTargets)
      ? {socketIds:socketTargets}
      : {socketId:socketTargets}

    await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER}/notify`,{
      ...targetPayload,
      event,
      data
    },{
      headers:{"x-socket-secret":process.env.SOCKET_INTERNAL_SECRET}
    })
}catch(error){
  console.log("error emitting event:",error)
}
}

export default emitEventHandler;
