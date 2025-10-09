"use client";
import Header from "@/app/components/Header";
import Navbar from "@/app/components/Navbar";
import Image from "next/image";
import { useLanguage } from "@/app/components/LanguageProvider";
import { useEffect, useState } from "react";

type Listing = {
  _id: string;
  placeType: string;
  photos?: string[];
  address?: { city?: string; state?: string };
  location?: { address?: string };
  createdAt?: string;
  userId?: string;
  price?: number;
};

export default function Home() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const { t } = useLanguage();
  const [city, setCity] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      let currentCity: string | null = null;
      try {
        currentCity = localStorage.getItem("currentCity");
        setCity(currentCity);
      } catch {}
      
      // Always fetch ALL listings (no city filter)
      const url = `/api/listings?t=${Date.now()}`;
        
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Check for duplicates before setting
        const uniqueListings = data.filter((listing, index, self) => 
          index === self.findIndex(l => l._id === listing._id)
        );
        setAllListings(uniqueListings);
        console.log(`Fetched ${data.length} listings (all cities), ${uniqueListings.length} unique`);
        if (data.length !== uniqueListings.length) {
          console.warn(`Found ${data.length - uniqueListings.length} duplicate listings`);
        }
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  // Filter listings based on selected city
  useEffect(() => {
    if (allListings.length > 0) {
      if (city) {
        // Filter listings by city for Popular homes section
        const cityFiltered = allListings.filter(listing => 
          listing.address?.city?.toLowerCase().includes(city.toLowerCase()) ||
          listing.address?.state?.toLowerCase().includes(city.toLowerCase()) ||
          listing.location?.address?.toLowerCase().includes(city.toLowerCase())
        );
        setFilteredListings(cityFiltered);
        console.log(`Filtered ${cityFiltered.length} listings for city: ${city}`);
      } else {
        // No city selected, show all listings
        setFilteredListings(allListings);
        console.log(`No city selected, showing all ${allListings.length} listings`);
      }
    } else {
      setFilteredListings([]);
    }
  }, [allListings, city]);

  useEffect(() => {
    fetchListings();
    
    // Listen for listing creation events
    const handleListingCreated = () => {
      console.log("Listing created, refreshing listings...");
      fetchListings();
    };

    // Listen for city changes
    const handleCityChange = () => {
      console.log("City changed, refreshing listings...");
      fetchListings();
    };

    window.addEventListener('listingCreated', handleListingCreated);
    window.addEventListener('cityChanged', handleCityChange);
    
    // Also refresh on page focus (in case user navigates back)
    const handleFocus = () => {
      fetchListings();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('listingCreated', handleListingCreated);
      window.removeEventListener('cityChanged', handleCityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Header />

      {/* Popular Homes Section - Show first */}
      {filteredListings.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-10 animate-fade-in">
          <h2 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {city ? `${t("popularHomesIn")} ${city}` : t("homePopularInCity")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredListings.slice(0, 4).map((l) => (
              <a
                href={`/listing/${l._id}`}
                key={l._id}
                className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-gray-200 animate-slide-up"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  {l.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.photos[0]}
                      alt={l.placeType}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src="/room.jpg"
                      alt={l.placeType}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium">{l.placeType?.toUpperCase()}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {l.address?.city || ""} {l.address?.state || ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Recently Hosted Section - Show second */}
      {allListings.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 animate-fade-in">
          <h2 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {t("homeRecentlyHosted")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allListings.slice(0, 6).map((l) => (
              <a
                href={`/listing/${l._id}`}
                key={l._id}
                className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-gray-200 animate-slide-up"
              >
                <div className="relative h-60 w-full overflow-hidden">
                  {l.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.photos[0]}
                      alt={l.placeType}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src="/hallRoom.jpg"
                      alt={l.placeType}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-base font-semibold">{l.placeType?.toUpperCase()}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {l.address?.city || ""} {l.address?.state || ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

    </>
  );
}


