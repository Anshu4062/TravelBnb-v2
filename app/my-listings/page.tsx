"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";

type Listing = {
  _id: string;
  placeType: string;
  photos?: string[];
  address?: { city?: string; state?: string };
  guests: number;
  bedrooms: number;
  beds: number;
  createdAt: string;
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user's listings
    const fetchListings = async () => {
      try {
        const response = await fetch("/api/listings/my-listings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setListings(data);
        } else {
          setError("Failed to fetch your listings");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  return (
    <div>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Your hosted places
          </h1>
          <p className="mt-2 text-gray-600">Manage and edit your listings</p>
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/listings");
                const data = await response.json();
                console.log("All listings in database:", data);
                alert(
                  `Found ${data.length} total listings. Check console for details.`
                );
              } catch (error) {
                console.log("Error fetching all listings:", error);
              }
            }}
            className="mt-2 rounded bg-blue-500 px-3 py-1 text-white text-sm"
          >
            Debug: Check all listings
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-12 w-12 text-gray-400"
              >
                <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No listings yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start hosting by creating your first listing
            </p>
            <Link
              href="/host"
              className="inline-flex items-center rounded-lg bg-rose-500 px-6 py-3 text-white font-medium transition-colors hover:bg-rose-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-2 h-5 w-5"
              >
                <path d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75V19.5a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" />
              </svg>
              Create listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing._id}
                href={`/edit-listing/${listing._id}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-gray-200"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  {listing.photos && listing.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.photos[0]}
                      alt={listing.placeType}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-12 w-12 text-gray-400"
                      >
                        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
                      {listing.guests} guest{listing.guests !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {listing.placeType}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {listing.address?.city || ""} {listing.address?.state || ""}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""}{" "}
                      • {listing.beds} bed{listing.beds !== 1 ? "s" : ""}
                    </span>
                    <span>Created {formatDate(listing.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
