import mongoose from "mongoose";
interface IUser{
  _id:mongoose.Types.ObjectId;
  name:string;
  email:string;
  password?:string;
  mobile?:string;
  role:"user" | "admin" | "deliveryBoy:";
  image?:string;
  location: {
    type: {
        type: StringConstructor;
        enum: string[];
        default: string;
    };
    coordinates: {
        type: NumberConstructor[];
        default: number[];
    };
};
socketId:string | null;
isOnline:boolean; 
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
  required:false,
  // Password may not be required for OAuth users
},
mobile:{
  type:String,
  required:false,
},
role:{
  type:String,
  enum:["user","admin","deliveryBoy"],
  default:"user",
},
image:{
  type:String
},
location:{
  type:{
    type:String,
    enum:["Point"],
    default:"Point"
  },
  coordinates:{
    type:[Number],
    default:[0,0]
    // Default coordinates (longitude, latitude) set to (0, 0)
  }
},
socketId:{
  type:String,
  default:null
},
isOnline:{
  type:Boolean,
  default:false
}
},{timestamps:true});


userSchema.index({location:"2dsphere"});

// Avoid model recompilation error in Next.js hot-reloading
// mongoose.models.User checks if the model already exists
// If it does, it uses the existing model; otherwise, it creates a new one.
// This is important in development environments where modules may be reloaded.
// 
// Without this check, redefining the model would lead to an error.

const User=mongoose.models.User || mongoose.model("User",userSchema);
export default User;