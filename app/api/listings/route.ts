import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating listing with body:", body);
    console.log("userId in body:", body.userId);
    console.log("price in body:", body.price);
    console.log("location in body:", body.location);

    await connectDB();

    // Debug: Check what we're about to save
    console.log("About to save listing with userId:", body.userId);

    // Debug: Try to create a new listing instance first
    const newListing = new Listing(body);
    console.log("New listing instance userId:", newListing.userId);
    console.log("New listing instance price:", newListing.price);
    console.log("New listing instance location:", newListing.location);
    console.log("Using collection:", newListing.collection.name);

    // Check for validation errors
    const validationError = newListing.validateSync();
    if (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        { error: "Validation failed: " + validationError.message },
        { status: 400 }
      );
    }

    const listing = await newListing.save();
    console.log("Created listing with ID:", listing._id);
    console.log("Created listing userId:", listing.userId);
    console.log("Created listing price:", listing.price);
    console.log("Created listing location:", listing.location);

    // Debug: Check the saved document
    const savedListing = await Listing.findById(listing._id);
    console.log("Saved listing from DB:", {
      id: savedListing?._id,
      userId: savedListing?.userId,
      price: savedListing?.price,
      location: savedListing?.location,
    });

    return NextResponse.json({ id: listing._id }, { status: 201 });
  } catch (e) {
    console.error("Error creating listing:", e);
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();

    // Fetch from both old and new collections
    const [oldListings, newListings] = await Promise.all([
      Listing.find({}).sort({ createdAt: -1 }).lean(),
      // Also check if there's a ListingV2 model available
      mongoose.models.ListingV2
        ? mongoose.models.ListingV2.find({}).sort({ createdAt: -1 }).lean()
        : [],
    ]);

    // Combine and sort all listings
    const allListings = [...newListings, ...oldListings]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 24);

    console.log(
      `Found ${oldListings.length} old listings and ${newListings.length} new listings`
    );

    return NextResponse.json(allListings, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
