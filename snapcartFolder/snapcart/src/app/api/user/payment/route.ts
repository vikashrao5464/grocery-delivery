// backend api for placing a new order using payment gateway
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prepareOrderItems } from "@/lib/prepareOrder";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const authSession=await auth();
    if(!authSession?.user?.id || authSession.user.role!=="user"){
      return NextResponse.json({message:"Unauthorized"},{status:401});
    }
    const { items, paymentMethod, address } =
      await req.json();
    if (!items || paymentMethod!=="online" || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const user = await User.findById(authSession.user.id);
    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    const {orderItems,totalAmount}=await prepareOrderItems(items);
    const newOrder = await Order.create({
      user: authSession.user.id,
      items:orderItems,
      paymentMethod,
      totalAmount,
      address,
    });
// create stripe checkout session
// session url will be sent to frontend to redirect user to stripe hosted payment page
    const appUrl=process.env.AUTH_URL || process.env.NEXTAUTH_URL;
    if(!appUrl) throw new Error("AUTH_URL is not configured");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${appUrl}/user/order-success`,
      cancel_url: `${appUrl}/user/checkout`,

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "snapcart order payment",
            },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      metadata:{orderId:newOrder._id.toString()}
    });

    return NextResponse.json({url:session.url},{status:200});
  } catch (error) {
    return NextResponse.json(
      {message:`order payment error :${error}`},
      {status:500}
    )
  }
}
