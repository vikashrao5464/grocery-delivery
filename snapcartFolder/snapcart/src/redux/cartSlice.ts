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
  cartData:IGrocery[],
  subTotal:number,
  deliveryFee:number,
  finalTotal:number
}
const initialState:IcartSlice={
  cartData:[],
  subTotal: 0,
  deliveryFee: 40,
  finalTotal: 40
}

const cartSlice=createSlice({

  name:"cart",
  initialState,
  reducers:{
    // here state is the current state of the user slice and action is the data which we want to store in the user slice and payload is the actual data inside the action
    addToCart:(state,action:PayloadAction<IGrocery>)=>{
      state.cartData.push(action.payload)
      // call calculateTotals reducer to update the total amount whenever an item is added to the cart
      cartSlice.caseReducers.calculateTotals(state)
    },

    // action payload is the id of the item to be added to the cart
    increaseQuantity:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
      const item=state.cartData.find(i=>i._id===action.payload)
      if(item){
        item.quantity=item.quantity+1;
      }

      // call calculateTotals reducer to update the total amount whenever an item quantity is increased
      cartSlice.caseReducers.calculateTotals(state)
    },

    decreaseQuantity:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
      const item=state.cartData.find(i=>i._id===action.payload)
      if(item?.quantity && item.quantity>1){
        item.quantity=item.quantity-1;
      }else{
        // remove the item from the cart if quantity is 1
       state.cartData = state.cartData.filter(i=>i._id!==action.payload)
      }
      // call calculateTotals reducer to update the total amount whenever an item quantity is decreased
      cartSlice.caseReducers.calculateTotals(state)
    },

    removeFromCart:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
      state.cartData = state.cartData.filter(i=>i._id!==action.payload)
      // call calculateTotals reducer to update the total amount whenever an item is removed from the cart
      cartSlice.caseReducers.calculateTotals(state)
    },

    // reducres for calculating the total amount of the cart
    calculateTotals:(state)=>{
      // here reduce is used to iterate through the cartData array and calculate the total amount,its initial value is 0 which is passed as second argument to reduce
      state.subTotal=state.cartData.reduce((sum,item)=>sum+Number(item.price)*item.quantity,0)
      state.deliveryFee=state.subTotal>100?0:40
      state.finalTotal=state.subTotal+state.deliveryFee
      // this reducers will be called whenever there is any change in the cartData array like adding or removing item or increasing or decreasing quantity ,so we will call this reducer in every other reducer
    }
  }
})
// exporting the action to be used in the components
export const {addToCart,increaseQuantity,decreaseQuantity,removeFromCart}=cartSlice.actions
// exporting the reducer to be used in the store
export default cartSlice.reducer