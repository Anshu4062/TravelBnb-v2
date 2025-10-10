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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Optional city filter (?city=Varanasi)
    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    
    // Helper function to extract city name from complex location strings
    const extractCityFromLocation = (locationString: string): string => {
      const location = locationString.toLowerCase().trim();
      
      // Handle "Nearby" case - don't filter for this
      if (location === 'nearby') {
        return '';
      }
      
      // Extract city from patterns like "New Delhi, Delhi" -> "delhi"
      const cityMatch = location.match(/^([^,]+)/);
      if (cityMatch) {
        let cityName = cityMatch[1].trim();
        
        // Handle common city name variations
        if (cityName.includes('new delhi')) return 'delhi';
        if (cityName.includes('mumbai')) return 'mumbai';
        if (cityName.includes('bangalore') || cityName.includes('bengaluru')) return 'bangalore';
        if (cityName.includes('kolkata') || cityName.includes('calcutta')) return 'kolkata';
        if (cityName.includes('chennai') || cityName.includes('madras')) return 'chennai';
        
        return cityName;
      }
      
      return location;
    };

    // Extract the main city name for filtering
    const cityToFilter = city ? extractCityFromLocation(city) : null;
    const cityRegex = cityToFilter ? new RegExp(cityToFilter, "i") : null;

    const query = cityRegex
      ? {
          $or: [
            { "address.city": cityRegex },
            { "address.state": cityRegex },
            // REMOVED: { "location.address": cityRegex } - ignore map location completely
          ],
        }
      : {};

    // Fetch from both old and new collections
    const [oldListings, newListings] = await Promise.all([
      Listing.find(query).sort({ createdAt: -1 }).lean(),
      // Also check if there's a ListingV2 model available
      mongoose.models.ListingV2
        ? mongoose.models.ListingV2.find(query)
            .sort({ createdAt: -1 })
            .lean()
        : [],
    ]);

    // Combine and deduplicate listings by _id
    const allListings = [...newListings, ...oldListings]
      .reduce((acc: any[], listing: any) => {
        const existingIndex = acc.findIndex(item => item._id.toString() === listing._id.toString());
        if (existingIndex === -1) {
          acc.push(listing);
        }
        return acc;
      }, [])
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 24);


    return NextResponse.json(allListings, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
