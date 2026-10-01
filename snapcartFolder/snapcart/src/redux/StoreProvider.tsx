'use client'
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Provider } from 'react-redux'
import { hydrateCart } from './cartSlice'
import { store } from './store'

const LEGACY_CART_STORAGE_KEY='snapcart-cart'
const getCartStorageKey=(userId:string)=>`snapcart-cart:${userId}`

function StoreProvider({children}:{children:React.ReactNode}) {
  const {data:session,status}=useSession()
  const userId=session?.user?.id

  useEffect(()=>{
    if(status==='loading') return

    // Remove the old browser-wide cart because it could belong to another user.
    localStorage.removeItem(LEGACY_CART_STORAGE_KEY)

    if(status!=='authenticated' || !userId){
      store.dispatch(hydrateCart([]))
      return
    }

    const cartStorageKey=getCartStorageKey(userId)

    try{
      const savedCart=localStorage.getItem(cartStorageKey)
      if(savedCart){
        const parsedCart=JSON.parse(savedCart)
        if(Array.isArray(parsedCart)){
          store.dispatch(hydrateCart(parsedCart))
        }else{
          localStorage.removeItem(cartStorageKey)
          store.dispatch(hydrateCart([]))
        }
      }else{
        store.dispatch(hydrateCart([]))
      }
    }catch(error){
      console.error('Failed to restore cart:',error)
      localStorage.removeItem(cartStorageKey)
      store.dispatch(hydrateCart([]))
    }

    const unsubscribe=store.subscribe(()=>{
      try{
        localStorage.setItem(
          cartStorageKey,
          JSON.stringify(store.getState().cart.cartData)
        )
      }catch(error){
        console.error('Failed to save cart:',error)
      }
    })

    return unsubscribe
  },[status,userId])

  return (
   <Provider store={store}>
    {children}
   </Provider>
  )
}
 
export default StoreProvider
