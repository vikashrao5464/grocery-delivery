'use client'
import React from 'react'
import useGetMe from './hooks/useGetMe'
// Component to initialize the user data when the app loads
// This component will use the useGetMe hook to get the user data from the server
// and store it in the redux store
// and this is further used in the root layout to initialize the user data when the app loads
function InitUser() {
  
    useGetMe()
    return null
  
}

export default InitUser
