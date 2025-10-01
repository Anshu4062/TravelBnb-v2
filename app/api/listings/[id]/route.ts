import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import mongoose from "mongoose";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Try to find in both old and new collections
    let doc = await Listing.findById(params.id).lean();

    if (!doc && mongoose.models.ListingV2) {
      doc = await mongoose.models.ListingV2.findById(params.id).lean();
    }

    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
