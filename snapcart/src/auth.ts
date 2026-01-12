import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./lib/db"
import User from "./models/user.model";
import bcrypt from "bcryptjs";
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials:{
        email:{label:"Email",type:"text"},
        password:{label:"Password",type:"password"}

      },
      async authorize(credentials,request){
       connectDb();
       const email=credentials.email;
       const password=credentials.password as string;
       const user=await User.findOne({email});
       if(!user){
        throw new Error("No user found with email");
       }
       const isMatch=await bcrypt.compare(password,user.password);
       if(!isMatch){
        throw new Error("Incorrect Password");
       }
       return{
        id:user._id,
        email:user.email,
        name:user.name,
        role:user.role
       }
      }
    })
  ],
  callbacks:{
// jwt token ke andar user ka data dalte h
// here token is generated at the time of sign in
// and sent to the client
// user is the object returned from authorize function
// we can add custom fields to the token
// for example, we are adding id, email and name to the token

   jwt({token,user}){
    if(user){
      token.id=user.id
      token.email=user.email,
      token.name=user.name,
      // token.role=user.role this is only available in runtime  we cannot directly assign .we have to typecast it globally in   next-auth.d.ts
      token.role=user.role
    }
    return token;
   },
   session({session,token}){
    if(session.user){
      session.user.id=token.id as string;
      session.user.email=token.email as string;
      session.user.name=token.name as string;
      session.user.role=token.role as string;
    }
    return session
   },
  },
  pages:{
    // this will tell us that where to redirect for sign in
    // 
    signIn:"/login",  
    error:"/login"
  },
  session:{
    // we are using jwt strategy for session
    // by default it is "database"
    strategy:"jwt",
    maxAge: 10*60*60*24 // 10 day
  },
  // secret for encrypting the jwt token
  secret:process.env.AUTH_SECRET
})