import mongoose from "mongoose";
interface IGrocery{
  _id:mongoose.Types.ObjectId,
  name:string,
  category:string,
  price:String,
  unit:string,
  image:string,
  createdAt:Date,
  updatedAt:Date,

}

const grocerySchema=new mongoose.Schema<IGrocery>({
  name:{
    type:String,
    required:true,
  },
  category:{
    type:String,
    enum:[
      "Fruits and Vegetables",
      "Dairy and Eggs",
      "Rice,Atta and Grains",
      "Snacks and Biscuits",
      "Spices and Masalas",
      "Beverages and Drinks",
      "Personal Care",
      "HouseHold Supplies",
      "Instant and Packed Foods",
      "Baby and Pet Care"
    ],
    required:true,
  },
  price:{
    type:Number,
    required:true,
  },
  unit:{
    type:String,
    required:true,
    enum:["kg","g","litre","ml","piece","pack"]

  },
  image:{
    type:String,
    required:true,
  }
},{timestamps:true});

const Grocery=mongoose.models.Grocery || mongoose.model<IGrocery>("Grocery",grocerySchema);
export default Grocery;