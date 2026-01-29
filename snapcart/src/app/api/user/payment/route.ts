// backend api for placing a new order using payment gateway
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { Currency } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { userId, items, paymentMethod, address, totalAmount } =
      await req.json();
    if (!userId || !items || !paymentMethod || !address || !totalAmount) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    const newOrder = await Order.create({
      user: userId,
      items,
      paymentMethod,
      totalAmount,
      address,
    });
// create stripe checkout session
// session url will be sent to frontend to redirect user to stripe hosted payment page
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_BASE_URL}/user/order-success`,
      cancel_url: `${process.env.NEXT_BASE_URL}/user/order-ccancel`,

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
