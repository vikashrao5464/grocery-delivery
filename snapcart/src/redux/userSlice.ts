// slice is the combination of action and reducers where action is  the data which we store and reducer is used to update the data in the store

import { createSlice } from "@reduxjs/toolkit";
import Mongoose, { set } from "mongoose";

interface IUser{
  _id:Mongoose.Types.ObjectId;
  name:string;
  email:string;
  password?:string;
  mobile?:string;
  role:"user" | "admin" | "deliveryBoy:";
  image?:string;
}

interface IuserSlice{
  userData:IUser|null
}
const initialState:IuserSlice={
  userData:null
}

const userSlice=createSlice({

  name:"user",
  initialState,
  reducers:{
    // here state is the current state of the user slice and action is the data which we want to store in the user slice and payload is the actual data inside the action
    setUserData:(state,action)=>{
      state.userData=action.payload
    }
  }
})
// exporting the action to be used in the components
export const {setUserData}=userSlice.actions
// exporting the reducer to be used in the store
export default userSlice.reducer