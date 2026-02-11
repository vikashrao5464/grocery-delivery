'use client'
import React from 'react'
import { Provider } from 'react-redux'

function StoreProvider({children}:{children:React.ReactNode}) {
  return (
   <Provider store={store}>
    {children}
   </Provider>
  )
}
import { store } from './store'
 
export default StoreProvider
