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
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchListings = async (locationFilter?: string) => {
    try {
      setIsLoading(true);
      let currentCity: string | null = null;
      try {
        currentCity = localStorage.getItem("currentCity");
        setCity(currentCity);
      } catch {}
      
      // Fetch listings with optional location filter
      let url = `/api/listings?t=${Date.now()}`;
      if (locationFilter) {
        url += `&city=${encodeURIComponent(locationFilter)}`;
      }
        
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
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract city name from complex location strings
  const extractCityFromLocation = (locationString: string): string => {
    // Handle special cases and extract the main city name
    const location = locationString.toLowerCase().trim();
    
    // Handle "Nearby" case - don't filter for this
    if (location === 'nearby') {
      return '';
    }
    
    // Extract city from patterns like "New Delhi, Delhi" -> "delhi"
    // or "Jaipur, Rajasthan" -> "jaipur"
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

  // Helper function to check if a listing matches the selected city
  const doesListingMatchCity = (listing: Listing, cityToFilter: string): boolean => {
    const listingCity = listing.address?.city?.toLowerCase() || '';
    const listingState = listing.address?.state?.toLowerCase() || '';
    
    // ONLY filter based on city/town field (user entered in host form)
    // Priority 1: Exact match in city field
    if (listingCity.includes(cityToFilter) || cityToFilter.includes(listingCity)) {
      return true;
    }
    
    // Priority 2: Match in state field (as fallback)
    if (listingState.includes(cityToFilter) || cityToFilter.includes(listingState)) {
      return true;
    }
    
    // IGNORE map location completely - only use city/town field
    return false;
  };

  // Filter listings based on selected city or selected location
  useEffect(() => {
    if (allListings.length > 0) {
      const filterBy = selectedLocation || city;
      if (filterBy) {
        // Extract the main city name from the selected location
        const cityToFilter = extractCityFromLocation(filterBy);
        
        if (!cityToFilter) {
          // For "Nearby" or empty filter, show all listings
          setFilteredListings(allListings);
          console.log(`No specific city to filter, showing all ${allListings.length} listings`);
          return;
        }
        
        // Filter listings by city/location for Popular homes section
        const filtered = allListings.filter(listing => {
          // Check if the listing matches the selected city using priority-based matching
          return doesListingMatchCity(listing, cityToFilter);
        });
        
        // If no matches found, show all listings
        if (filtered.length === 0) {
          setFilteredListings(allListings);
        } else {
          setFilteredListings(filtered);
        }
      } else {
        // No city/location selected, show all listings
        setFilteredListings(allListings);
      }
    } else {
      setFilteredListings([]);
    }
  }, [allListings, city, selectedLocation]);

  useEffect(() => {
    fetchListings();
    
    // Listen for listing creation events
    const handleListingCreated = () => {
      fetchListings();
    };

    // Listen for city changes
    const handleCityChange = () => {
      fetchListings();
    };

    // Listen for location selection from Header component
    const handleLocationSelected = (event: CustomEvent) => {
      const location = event.detail.location;
      setSelectedLocation(location);
      if (location) {
        fetchListings(location);
      } else {
        // If location is cleared, fetch all listings
        fetchListings();
      }
    };

    window.addEventListener('listingCreated', handleListingCreated);
    window.addEventListener('cityChanged', handleCityChange);
    window.addEventListener('locationSelected', handleLocationSelected as EventListener);
    
    // Also refresh on page focus (in case user navigates back)
    const handleFocus = () => {
      fetchListings();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('listingCreated', handleListingCreated);
      window.removeEventListener('cityChanged', handleCityChange);
      window.removeEventListener('locationSelected', handleLocationSelected as EventListener);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Header />

      {/* Popular Homes Section - Show first */}
      {(selectedLocation || city) && (
        <section className="mx-auto w-full max-w-7xl px-4 py-10 animate-fade-in">
          <h2 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {selectedLocation ? `${t("popularHomesIn")} ${selectedLocation}` : 
             city ? `${t("popularHomesIn")} ${city}` : t("homePopularInCity")}
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : filteredListings.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                {selectedLocation ? `No homes available in ${selectedLocation}` : 
                 city ? `No homes available in ${city}` : "No homes available"}
              </div>
              <p className="text-gray-400 text-sm">
                Try searching for a different location or browse all available homes below.
              </p>
            </div>
          )}
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


