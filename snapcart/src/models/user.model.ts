import mongoose from "mongoose";
interface IUser{
  _id:mongoose.Types.ObjectId;
  name:string;
  email:string;
  password:string;
  mobile?:string;
  role:"user" | "admin" | "deliveryBoy:";
}
const userSchema=new mongoose.Schema<IUser>({
name:{
  type:String,
  required:true,
},
email:{
  type:String,
  required:true,
  unique:true,
},
password:{
  type:String,
  required:true,
},
mobile:{
  type:String,
  required:false,
},
role:{
  type:String,
  enum:["user","admin","deliveryBoy"],
  default:"user",
}
},{timestamps:true});

// Avoid model recompilation error in Next.js hot-reloading
// mongoose.models.User checks if the model already exists
// If it does, it uses the existing model; otherwise, it creates a new one.
// This is important in development environments where modules may be reloaded.
// 
// Without this check, redefining the model would lead to an error.

const User=mongoose.models.User || mongoose.model("User",userSchema);
export default User;