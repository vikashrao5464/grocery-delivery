import mongoose from "mongoose";

export interface IOrder{
  _id:mongoose.Types.ObjectId,
  user:mongoose.Types.ObjectId,
  isPaid:boolean,
  items:[
    {
      grocery:mongoose.Types.ObjectId,
      name:string,
      price:string,
      unit:string,
      image:string,
      quantity:number,
    }
  ]
  totalAmount:number,
  paymentMethod:"cod" | "online",
  address:{
    fullName:string,
    mobile:string,
    city:string,
    state:string,
    pincode:string,
    fullAddress:string,
    latitude:number,
    longitude:number,
  }
  status:"pending" | "out of delivery" | "delivered",
  createdAt?:Date
  updatedAt?:Date
}

const orderSchema=new mongoose.Schema<IOrder>({
user:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true,
},
isPaid:{
  type:Boolean,
  default:false,
},
items:[{
  grocery:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Grocery",
    required:true
  },
  name:String,
  price:String,
  unit:String,
  image:String,
  quantity:Number,
}],
totalAmount:{
  type:Number,
  required:true,
},
paymentMethod:{
  type:String,
  enum:["cod","online"],
  default:"cod"
},
address:{
   fullName:String,
    mobile:String,
    city:String,
    state:String,
    pincode:String,
    fullAddress:String,
    latitude:Number,
    longitude:Number,
},
status:{
  type:String,
  enum:["pending","out of delivery" , "delivered"]
}


},{timestamps:true});

const Order=mongoose.models.Order || mongoose.model<IOrder>("Order",orderSchema);
export default Order;