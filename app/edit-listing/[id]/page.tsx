"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use as useUnwrap } from "react";
import Navbar from "@/app/components/Navbar";

type Listing = {
  _id: string;
  placeType: string;
  photos?: string[];
  address?: { city?: string; state?: string };
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: { privateAttached: number; dedicated: number; shared: number };
  locksAllBedrooms: boolean;
  whoThere?: string[];
  amenitiesFav?: string[];
  amenitiesStandout?: string[];
  safetyItems?: string[];
};

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = useUnwrap(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        if (data && !data.error) {
          setListing(data);
        } else {
          setError("Listing not found");
        }
      } catch {
        setError("Failed to fetch listing");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-rose-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div>
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Listing not found"}
            </h1>
            <button
              onClick={() => router.back()}
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              ← Go back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-rose-600 hover:text-rose-700 font-medium"
          >
            ← Back to my listings
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit listing</h1>
          <p className="mt-2 text-gray-600">
            {listing.placeType} • {listing.address?.city || ""}{" "}
            {listing.address?.state || ""}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border p-6">
              <h2 className="mb-6 text-xl font-semibold">Listing Details</h2>

              {/* Photos */}
              {listing.photos && listing.photos.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-medium">Photos</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {listing.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Place Type
                    </label>
                    <input
                      type="text"
                      value={listing.placeType}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <input
                      type="number"
                      value={listing.guests}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={listing.bedrooms}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beds
                    </label>
                    <input
                      type="number"
                      value={listing.beds}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">Bathrooms</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Private & Attached
                    </label>
                    <input
                      type="number"
                      value={listing.bathrooms.privateAttached}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dedicated
                    </label>
                    <input
                      type="number"
                      value={listing.bathrooms.dedicated}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shared
                    </label>
                    <input
                      type="number"
                      value={listing.bathrooms.shared}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {listing.amenitiesFav && listing.amenitiesFav.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-medium">Guest Favorites</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenitiesFav.map((amenity, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {listing.amenitiesStandout &&
                listing.amenitiesStandout.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-medium">
                      Standout Amenities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenitiesStandout.map((amenity, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {listing.safetyItems && listing.safetyItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-medium">Safety Items</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.safetyItems.map((item, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border p-6">
              <h3 className="mb-4 text-lg font-semibold">Actions</h3>
              <div className="space-y-3">
                <button className="w-full rounded-lg bg-rose-500 px-4 py-2 text-white font-medium transition-colors hover:bg-rose-600">
                  Edit Details
                </button>
                <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 font-medium transition-colors hover:bg-gray-50">
                  Add Photos
                </button>
                <button className="w-full rounded-lg border border-red-300 px-4 py-2 text-red-600 font-medium transition-colors hover:bg-red-50">
                  Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
