import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { isInternalSocketRequest } from "@/lib/socketSecurity";

export async function POST(req: NextRequest) {
  try {
    if(!isInternalSocketRequest(req)){
      return NextResponse.json({message:"Unauthorized"},{status:401});
    }
    await connectDb();

    const { socketId } = await req.json();

    if (!socketId || typeof socketId !== "string") {
      return NextResponse.json(
        { success: false, message: "socketId is required" },
        { status: 400 }
      );
    }

    // Remove only the disconnected device and atomically derive online status
    // from the active sockets that remain.
    await User.findOneAndUpdate(
      { socketIds: socketId },
      [
        {
          $set: {
            socketIds: {
              $filter: {
                input: { $ifNull: ["$socketIds", []] },
                as: "activeSocketId",
                cond: { $ne: ["$$activeSocketId", socketId] },
              },
            },
          },
        },
        {
          $set: {
            isOnline: { $gt: [{ $size: "$socketIds" }, 0] },
          },
        },
      ]
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Socket disconnect update failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
