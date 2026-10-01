// backend api for placing a new order using cod

import connectDb from "@/lib/db";
import { emitEventHandler } from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prepareOrderItems } from "@/lib/prepareOrder";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const session=await auth();
    if(!session?.user?.id || session.user.role!=="user"){
      return NextResponse.json({message:"Unauthorized"},{status:401});
    }
    const { items, paymentMethod, address } =
      await req.json();
    if (!items || paymentMethod!=="cod" || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    const {orderItems,totalAmount}=await prepareOrderItems(items);
    const newOrder = await Order.create({
      user: session.user.id,
      items:orderItems,
      paymentMethod,
      totalAmount,
      address,
      status: "pending",
    });

    // emit new order event to all connected clients
    await emitEventHandler("new-order", newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {message:`place order error :${error}`},
      {status:500}
    )
  }
}
