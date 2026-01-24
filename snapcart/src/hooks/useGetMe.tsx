'use client'
import React, { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store';
import { setUserData } from '@/redux/userSlice';

// custom hook to get the user data from the server and store it in the redux store
// This hook will be used in the InitUser component to initialize the user data when the app loads
// It will make a GET request to the /api/me endpoint to get the user data
function useGetMe() {
  const dispatch=useDispatch<AppDispatch>();
  return (
    useEffect(()=>{
      const getMe=async () => {
        try{
          const result=await axios.get('/api/me');
          // store the user data in the redux store
         dispatch(setUserData(result.data));
        }catch(error){
          console.log("get me error",error);
        }
      };
      getMe();
    },[])
  )
}

export default useGetMe
