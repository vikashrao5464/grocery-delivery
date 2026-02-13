'use client'
import { getSocket } from '@/lib/socket';
import React, { useEffect } from 'react'

function GeoUpdater({userId}:{userId:string}) {
 
  let socket=getSocket();

  socket.emit("identity",userId);
  useEffect(()=>{
  if(!userId) return;
  if(!navigator.geolocation) return;
  const watcher=navigator.geolocation.watchPosition((pos)=>{
    // Emit the updated location to the server 
    // watchposition is used to continuously track the user's location and update it in real-time as it changes, which is essential for features like live delivery tracking or location-based services.
    const lat=pos.coords.latitude;
    const lon=pos.coords.longitude;

    socket.emit("update-location",{
      userId,
      latitude:lat,
      longitude:lon
    })
  },(err)=>{
    console.log(err)
  },{enableHighAccuracy:true})

  // Clean up the watcher when the component unmounts


  return()=>navigator.geolocation.clearWatch(watcher);
  },[userId])

  return null;
}

export default GeoUpdater