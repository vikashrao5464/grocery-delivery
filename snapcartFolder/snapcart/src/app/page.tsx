import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import User from "@/models/user.model";
import EditRoleMobile from "@/components/EditRoleMobile";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import GeoUpdater from "@/components/GeoUpdater";
import Grocery, { IGrocery } from "@/models/grocery.model";
import Footer from "@/components/footer";



// this is home page for editing mobile and role and
// this is server component

export default async function Home(props:{searchParams:Promise<{q:string}>}) {


  //so we have to use searchParams to get the query params
  const searchParams = await props.searchParams;
  connectDb();
  const session = await auth()
  // in server component we can use await for getting current session
  const user = await User.findById(session?.user?.id);
  if (!user) {
    redirect('/login');
  }
  const inComplete = !user.role || !user.mobile || (!user.mobile && user.role === "user");
  if (inComplete) {
    return <EditRoleMobile />;
  }
  const plainUser = JSON.parse(JSON.stringify(user));

  let groceryList:IGrocery[]=[]
// if user is user then we will show the grocery list based on the search query
  if(user.role==="user" ){
     if(searchParams.q){
      groceryList=await Grocery.find({
        $or:[
          {name:{$regex:searchParams?.q || "",$options:"i"}},
          {category:{$regex:searchParams?.q || "",$options:"i"}},

        ]
      })
  }else{
    groceryList=await Grocery.find({});
  }
}
  return (

    <>
      <Nav user={plainUser} />
      <GeoUpdater userId={plainUser._id} />
      {user.role === "user" ? (
        <UserDashboard groceryList={groceryList}/>
      ) : user.role === "admin" ? (
        <AdminDashboard />

      ) : <DeliveryBoy />
      }
      <Footer/>
    </>
  );
}
