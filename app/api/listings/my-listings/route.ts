import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT secret not configured" },
        { status: 500 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
      console.log("Decoded userId from token:", userId);
    } catch (error) {
      console.log("JWT verification error:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    console.log("Searching for listings with userId:", userId);

    // Search in both old and new collections
    const [oldListings, newListings] = await Promise.all([
      Listing.find({ userId }).sort({ createdAt: -1 }).lean(),
      // Also check if there's a ListingV2 model available
      mongoose.models.ListingV2
        ? mongoose.models.ListingV2.find({ userId })
            .sort({ createdAt: -1 })
            .lean()
        : [],
    ]);

    // Combine and sort all listings
    const allUserListings = [...newListings, ...oldListings].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(
      `Found ${oldListings.length} old listings and ${newListings.length} new listings for user`
    );
    console.log("Sample listing data:", allUserListings.slice(0, 2));

    return NextResponse.json(allUserListings, { status: 200 });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
