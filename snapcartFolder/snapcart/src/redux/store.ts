import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import cartSlice from "./cartSlice";
export const store=configureStore({
  // in reducer we will add different slices such as userSlice,cartSlice etc
  reducer:{
   user:userSlice,
   cart:cartSlice
  }
})
// If your store has:
// { user: {...}, cart: {...} }
// Then RootState = { user: UserState, cart: CartState }
export type RootState = ReturnType<typeof store.getState>
// appDispatch type for use throughout the app for entering data into the store
export type AppDispatch = typeof store.dispatch