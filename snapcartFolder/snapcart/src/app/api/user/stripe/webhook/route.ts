
// Import Stripe SDK and Next.js API types
import { Stripe } from "stripe";
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Stripe Webhook Handler
 * Handles POST requests from Stripe for webhook events (e.g., payment completion).
 * Verifies the event signature, updates order status in the database if payment is successful.
 */
export async function POST(req: NextRequest) {
    console.log("Stripe webhook endpoint called");
  // Retrieve Stripe signature from headers
  const sig = req.headers.get("Stripe-Signature")!;
  // Get the raw request body as text (required for Stripe signature verification)
  const rawBody = await req.text();
  let event;
  try {
    // Verify the event came from Stripe using the webhook secret
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    // Signature verification failed
    console.log("signature verification failed", error);
  }

  // Handle successful checkout session completion
  if (event?.type === "checkout.session.completed") {
    // Get the session object from the event
    const session = event.data.object;
    // Connect to the database
    await connectDb();
    // Update the order as paid using the orderId from session metadata
    await Order.findByIdAndUpdate(session?.metadata?.orderId, {
      isPaid: true
    });
  }
  // Respond to Stripe to acknowledge receipt of the event
  return NextResponse.json({ received: true }, { status: 200 });
}