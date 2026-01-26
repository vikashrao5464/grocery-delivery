'use client'
import React, { useEffect, useState } from 'react'
import { animate, motion } from "motion/react"
import { ArrowLeft, Building, CreditCard, CreditCardIcon, Home, Loader, LocateFixed, MapPin, Phone, PinIcon, Search, StarHalf, Truck, TruckElectric, User } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
// importing leaflet css for map view from node modules
import "leaflet/dist/leaflet.css";

import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';

import axios from 'axios';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { set } from 'mongoose';
import { on } from 'events';



const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/7945/7945007.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
})

function Checkout() {
  const router = useRouter();
  // getting user data from redux store
  const { userData } = useSelector((state: RootState) => state.user)
 const {subTotal,deliveryFee,finalTotal}=useSelector((state:RootState)=>state.cart);

  // state for search query in search field of address
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  // state for payment method
  const [paymentMethod,setPaymentMethod]=useState<"cod" | "online">("cod");

  // state for address details

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: ""

  })

  // for map we use leaflet opensource js library
  // for getting user location
  // navigator is a web api to get user location ,it is in build in object in the browser
  // navigator.geolocation.getCurrentPosition is a method to get the current position of the user
  // it takes a callback function as an argument which will be called when the position is obtained
  // in position we get the latitude and longitude of the user

  // npm install  --save leaflet-geosearch for searching location on map
  const [position, setPosition] = useState<[number, number] | null>(null)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
      }, (err) => { console.log("location error:", err) }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    }
  }, [])

  // Update address when userData is available
  useEffect(() => {
    if (userData) {
      setAddress((prev) => ({ ...prev, fullName: userData?.name || "" }))
      setAddress((prev) => ({ ...prev, mobile: userData?.mobile || "" }))
    }
  }, [userData]);

  // console.log("address", address);

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

  // function for handling current location button
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
      }, (err) => { console.log("location error:", err) }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    }
  }


// function for handling search query
  const handleSearchQuery = async () => {
    setSearchLoading(true);
    // function for handling search query
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: searchQuery });
    if (results) {
      setSearchLoading(false);
      setPosition([results[0].y, results[0].x]);
    }

  }

  // for fetching address from lat and lon using nominatim openstreetmap api
  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      try {
        const result = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`)
        console.log("address data:", result.data);
        setAddress((prev) => ({ ...prev, city: result.data.address.county || result.data.address.city, state: result.data.address.state, pincode: result.data.address.postcode, fullAddress: result.data.display_name }))
      } catch (error) {
        console.log("map error:", error);
      }
    }
    fetchAddress();


  }, [position])


  return (
    <div className='w-[92%] md:w-[80%] mx-auto py-10 relative'>

      {/* Back to Cart Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        className='absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold'
        onClick={() => router.push("/user/cart")}
      >
        <ArrowLeft size={16} />
        <span>Back to Cart</span>
      </motion.button>


      {/* page heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='text-3xl md:text-4xl font-bold text-green-700 text-center mb-10'>Checkout
      </motion.h1>

      {/* address details */}
      <div className='grid md:grid-cols-2 gap-8'>
        {/* address detail column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100'
        >
          {/* /address details */}
          <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 '>
            <MapPin className='text-green-700' /> Delivery Address </h2>

          <div className='space-y-4'>
            <div className='relative '>
              <User className='absolute left-3 top-3 text-green-600 ' size={18} />
              <input type="text" value={address.fullName || ""} onChange={(e) => setAddress((prev) => ({ ...prev, fullName: e.target.value }))} className='pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50' />
            </div>

            <div className='relative '>
              <Phone className='absolute left-3 top-3 text-green-600 ' size={18} />
              <input type="text" value={address.mobile || ""} onChange={(e) => setAddress((prev) => ({ ...prev, mobile: e.target.value }))} className='pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50' />
            </div>

            <div className='relative '>
              <Home className='absolute left-3 top-3 text-green-600 ' size={18} />
              <input type="text" value={address.fullAddress || ""} onChange={(e) => setAddress((prev) => ({ ...prev, fullAddress: e.target.value }))} placeholder='Full Address' className='pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50' />
            </div>

            {/* for city state and pincode */}
            <div className='grid grid-cols-3 gap-3 '>

              <div className='relative '>
                <Building className='absolute left-3 top-3 text-green-600 ' size={18} />
                <input type="text" value={address.city || ""} onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))} placeholder='City' className='pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50' />
              </div>



              <div className='relative '>
                <StarHalf className='absolute left-3 top-3 text-green-600 ' size={18} />
                <input type="text" value={address.state || ""} onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))} placeholder='State' className='pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50' />
              </div>

              <div className='relative '>
                <Search className='absolute left-3 top-3 text-green-600 ' size={18} />
                <input type="text" value={address.pincode || ""} onChange={(e) => setAddress((prev) => ({ ...prev, pincode: e.target.value }))} placeholder='Pincode' className='pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50' />
              </div>
            </div>

            {/* div for search city */}
            <div className='flex gap-2 mt-3'>
              <input type="text" placeholder='Search city or area...' className='flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button className='bg-green-600 text-white px-5 rounded-lg hover:bg-green-700 transition-all font-medium' onClick={handleSearchQuery}>{searchLoading ? <Loader className='w-5 h-5 animate-spin' /> : "Search"}</button>
            </div>

            {/* map container */}
            {/* // we use npm i leaflet for map view
              // and npm i react-leaflet for using leaflet in react
              // for types we use npm i @types/leaflet */}
            <div className='relative mt-6 h-[330px] rounded-xl overflow-hidden border border-gray-200 shadow-inner'>
              {position && <MapContainer center={position as LatLngExpression} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* for showing pin point on map */}
                <DraggableMarker />
              </MapContainer>}

              {/* button for current location */}
              <motion.button
                whileTap={{ scale: 0.93 }}
                className='absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-[999]' onClick={handleCurrentLocation}
              >
                <LocateFixed size={22} />
              </motion.button>
            </div>

          </div>

        </motion.div>

        {/* order summary column */}

        <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit'
        >
          <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 '>
           <CreditCard /> Payment Method</h2>

          {/* .payment mthods */}
           <div className='space-y-4 mb-6'>
              {/* online payment buttons */}
            <button className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod==="online" ? "border-green-600 bg-green-50  shadow-sm":
             "hover:bg-gray-50"
            }`} onClick={()=>setPaymentMethod("online")}>
              <CreditCardIcon className='text-green-600 '/><span className='font-medium text-gray-700'>Pay Online (stripe)</span>
            </button>

            {/* cod button */}
            <button className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod==="cod" ? "border-green-600 bg-green-50  shadow-sm":
             "hover:bg-gray-50"
            }`} onClick={()=>setPaymentMethod("cod")}>
              <Truck className='text-green-600 '/><span className='font-medium text-gray-700'>Cash on Delivery</span>
            </button>
           </div>



          {/* order summary details */}
          <div className='border-t pt-4 text-gray-700 space-y-2 text-sm sm:text-base'>
            <div className='flex justify-between'>
              <span className='font-semibold'>SubTotal</span>
              <span className='font-semibold text-green-600'>₹ {subTotal.toFixed(2)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='font-semibold'>Delivery Fee</span>
              <span className='font-semibold text-green-600'>₹ {deliveryFee.toFixed(2)}</span>
            </div>
            <div className='flex justify-between font-bold text-lg border-t pt-3'>
              <span className='font-semibold'>Total</span>
              <span className='font-semibold text-green-600'>₹ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* button for placing order */}
          <motion.button 
          whileTap={{scale:0.93}}
          className='w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all font-semibold '
          >
            {paymentMethod==="cod" ? "Place Order" : "Pay & Place Order"}
          </motion.button>
        </motion.div>

      </div>

    </div>
  )
}

export default Checkout
