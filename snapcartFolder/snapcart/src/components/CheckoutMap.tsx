'use client'

import React, { useEffect } from 'react'
// importing leaflet css for map view from node modules
import "leaflet/dist/leaflet.css";

import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';

const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/7945/7945007.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
})

type props={
  position:[number,number],
  setPosition:(pos:[number,number])=>void
}

function CheckOutMap({position,setPosition}:props) {

  //  function for draggable marker on map
    const DraggableMarker: React.FC = () => {
      const map = useMap();
      useEffect(() => {
        map.setView(position as LatLngExpression, 15, { animate: true });
        // here 15 is zoom level
      }, [position, map])
  
  
      return <Marker icon={markerIcon}
        position={position as LatLngExpression}
        //  for draggable marker
        draggable={true}
        // for updating position on drag end
        eventHandlers={{
          dragend: (e: L.LeafletEvent) => {
            const marker = e.target as L.Marker
            const { lat, lng } = marker.getLatLng()
            setPosition([lat, lng])
  
          }
        }}
      />
    }
  return (
    <MapContainer center={position as LatLngExpression} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* for showing pin point on map */}
                <DraggableMarker />
              </MapContainer>
  )
}

export default CheckOutMap