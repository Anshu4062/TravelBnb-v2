import mongoose, { Schema, Document } from "mongoose";

export interface IListing extends Document {
  userId: string;
  placeType: string;
  guests: number;
  bedrooms: number;
  beds: number;
  locksAllBedrooms: boolean;
  bathrooms: {
    privateAttached: number;
    dedicated: number;
    shared: number;
  };
  whoThere: string[];
  amenitiesFav: string[];
  amenitiesStandout: string[];
  safetyItems: string[];
  address: {
    country: string;
    unit?: string;
    street?: string;
    landmark?: string;
    district?: string;
    city?: string;
    state?: string;
    pin?: string;
  };
  photos: string[];
  price: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const ListingSchema = new Schema<IListing>(
  {
    userId: { type: String, required: true, index: true },
    placeType: { type: String, required: true },
    guests: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    beds: { type: Number, required: true },
    locksAllBedrooms: { type: Boolean, required: true },
    bathrooms: {
      privateAttached: { type: Number, default: 0 },
      dedicated: { type: Number, default: 0 },
      shared: { type: Number, default: 0 },
    },
    whoThere: [{ type: String }],
    amenitiesFav: [{ type: String }],
    amenitiesStandout: [{ type: String }],
    safetyItems: [{ type: String }],
    address: {
      country: String,
      unit: String,
      street: String,
      landmark: String,
      district: String,
      city: String,
      state: String,
      pin: String,
    },
    photos: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: true },
    },
  },
  {
    timestamps: true,
    strict: false, // Allow additional fields
  }
);

export default mongoose.models.ListingV2 ||
  mongoose.model<IListing>("ListingV2", ListingSchema);
