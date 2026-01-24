// slice is the combination of action and reducers where action is  the data which we store and reducer is used to update the data in the store

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";


interface IGrocery{
  _id:mongoose.Types.ObjectId,
  name:string,  
  category:string,
  price:String,
  unit:string,
  quantity:number,
  image:string,
  createdAt:Date,
  updatedAt:Date,

}

interface IcartSlice{
  cartData:IGrocery[] 
}
const initialState:IcartSlice={
cartData:[]
}

const cartSlice=createSlice({

  name:"cart",
  initialState,
  reducers:{
    // here state is the current state of the user slice and action is the data which we want to store in the user slice and payload is the actual data inside the action
    addToCart:(state,action:PayloadAction<IGrocery>)=>{
      state.cartData.push(action.payload)
    }
  }
}
)
// exporting the action to be used in the components
export const {addToCart}=cartSlice.actions
// exporting the reducer to be used in the store
export default cartSlice.reducer