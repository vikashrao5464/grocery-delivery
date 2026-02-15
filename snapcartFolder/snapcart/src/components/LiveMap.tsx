import React, { useEffect } from 'react'
import L, { LatLngExpression } from 'leaflet';
import { MapContainer } from 'react-leaflet/MapContainer';
import { TileLayer } from 'react-leaflet/TileLayer';
import { Marker } from 'react-leaflet/Marker';
import { Polyline } from 'react-leaflet/Polyline';
import "leaflet/dist/leaflet.css";
import { Popup } from 'react-leaflet/Popup';
import { useMap } from 'react-leaflet';


interface ILocation {
  latitude: number,
  longitude: number
}

interface IProps {
  userLocation: ILocation,
  deliveryBoyLocation: ILocation
}

// Recenter component is used to recenter the map to the user's location when the location changes, it uses useMap hook from react-leaflet to get the map instance and then sets the view to the new location with animation whenever the userLocation prop changes.
function Recenter({positions}:{positions:[number,number]}) {

  const map=useMap();
  useEffect(()=>{
    // Only recenter if we have valid coordinates (not 0, 0)
    if(positions[0]!==0 && positions[1]!==0){
    map.setView(positions,map.getZoom(),{
      animate:true
    })
    }
    
  },[positions,map])
return null;
}



function LiveMap({ userLocation, deliveryBoyLocation }: IProps) {

  const deliveryBoyIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561839.png",
    iconSize: [45, 45]
  })

  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
    iconSize: [45, 45]
  })

  const linepositions=
         deliveryBoyLocation && userLocation ?[
          [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude],
          [userLocation.latitude, userLocation.longitude]
         ]:[]

  const center = [userLocation.latitude, userLocation.longitude]
  return (
    <div className='w-full h-[500px] rounded-xl overflow-hidden shadow relative'>
      <MapContainer center={center as LatLngExpression} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
        <Recenter positions={center as any}/>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} >
          <Popup>Delivery Address</Popup>
        </Marker>

        {deliveryBoyLocation && <Marker position={[deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]} icon={deliveryBoyIcon}>
        <Popup>Delivery Boy</Popup>
        </Marker>}

  {/* line between delivery boy and delivery location */}
         <Polyline positions={linepositions as any} pathOptions={{ color: "blue", weight: 3 }} />
        

      </MapContainer>
    </div>
  )
}

export default LiveMap