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
// this is home page for editing mobile and role and
// this is server component

export default async function Home() {
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
  return (

    <>
      <Nav user={plainUser} />
      {user.role === "user" ? (
        <UserDashboard />
      ) : user.role === "admin" ? (
        <AdminDashboard />

      ) : <DeliveryBoy />
      }
    </>
  );
}
