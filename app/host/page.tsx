"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Google Maps types
declare global {
  interface Window {
    google: any;
  }
  interface HTMLElement {
    _map?: any;
    _marker?: any;
  }
}

type CounterProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};

const Counter = ({
  label,
  value,
  onChange,
  min = 0,
  max = 50,
}: CounterProps) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 shadow-sm transition hover:shadow-md">
      <span className="text-[15px] font-medium text-gray-900">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`decrease ${label}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:bg-gray-50 active:scale-95"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold text-gray-900">
          {value}
        </span>
        <button
          type="button"
          aria-label={`increase ${label}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:bg-gray-50 active:scale-95"
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
};

const PROPERTY_TYPES = [
  "House",
  "Flat/apartment",
  "Barn",
  "Bed & breakfast",
  "Boat",
  "Cabin",
  "Campervan/motorhome",
  "Casa particular",
  "Castle",
  "Cave",
  "Container",
  "Cycladic home",
  "Dammuso",
  "Dome",
  "Earth home",
  "Farm",
  "Guest house",
  "Hotel",
  "Houseboat",
  "Riad",
  "Ryokan",
  "Shepherd’s hut",
  "Tent",
  "Tiny home",
  "Tower",
  "Tree house",
  "Trullo",
  "Windmill",
  "Yurt",
];

export default function HostPage() {
  const router = useRouter();
  const [guests, setGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [locksAllBedrooms, setLocksAllBedrooms] = useState<boolean | null>(
    null
  );

  const [address, setAddress] = useState({
    country: "India - IN",
    unit: "",
    street: "",
    landmark: "",
    district: "",
    city: "",
    state: "",
    pin: "",
  });

  const [placeType, setPlaceType] = useState<string>("");
  const [bathsPrivate, setBathsPrivate] = useState(0);
  const [bathsDedicated, setBathsDedicated] = useState(0);
  const [bathsShared, setBathsShared] = useState(0);

  // Additional sections state
  const [whoThere, setWhoThere] = useState<string[]>([]);
  const [amenitiesFav, setAmenitiesFav] = useState<string[]>([]);
  const [amenitiesStandout, setAmenitiesStandout] = useState<string[]>([]);
  const [safetyItems, setSafetyItems] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [stateSearchTerm, setStateSearchTerm] = useState<string>("");
  const [showStateDropdown, setShowStateDropdown] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [userId, setUserId] = useState<string | null>(null);

  // Indian States and Union Territories list
  const statesAndUTs = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  // Filter states based on search term
  const filteredStates = statesAndUTs.filter((state) =>
    state.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login?next=/host");
      return;
    }

    // Get userId from token
    try {
      const userData = localStorage.getItem("user");
      console.log("Raw user data from localStorage:", userData);

      if (userData) {
        const user = JSON.parse(userData);
        console.log("Parsed user data:", user);
        console.log("User keys:", Object.keys(user));
        console.log("User _id:", user._id);
        console.log("User id:", user.id);

        if (user._id) {
          setUserId(user._id);
          console.log("✅ Set userId from localStorage to:", user._id);
        } else if (user.id) {
          setUserId(user.id);
          console.log(
            "✅ Set userId from localStorage (id field) to:",
            user.id
          );
        } else {
          console.log("❌ No _id or id found in user data, trying token");
          const userIdFromToken = getUserIdFromToken(token);
          if (userIdFromToken) {
            setUserId(userIdFromToken);
            console.log("✅ Set userId from token to:", userIdFromToken);
          } else {
            console.log("❌ Could not get userId from token either");
          }
        }
      } else {
        console.log("❌ No user data found in localStorage, trying token");
        const userIdFromToken = getUserIdFromToken(token);
        if (userIdFromToken) {
          setUserId(userIdFromToken);
          console.log("✅ Set userId from token to:", userIdFromToken);
        } else {
          console.log("❌ Could not get userId from token");
        }
      }
    } catch (error) {
      console.error("❌ Error parsing user data:", error);
    }
  }, [router]);

  // Function to decode JWT token and get userId
  const getUserIdFromToken = (token: string): string | null => {
    try {
      console.log("Decoding token:", token);
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Token payload:", payload);
      console.log("Token userId:", payload.userId);
      return payload.userId || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Function to validate form fields
  const validateForm = (): boolean => {
    const errors: { [key: string]: boolean } = {};
    let isValid = true;

    // Required fields validation
    if (!placeType) {
      errors.placeType = true;
      isValid = false;
    }
    if (!address.country) {
      errors.country = true;
      isValid = false;
    }
    if (!address.city) {
      errors.city = true;
      isValid = false;
    }
    if (!address.state) {
      errors.state = true;
      isValid = false;
    }
    if (guests <= 0) {
      errors.guests = true;
      isValid = false;
    }
    if (bedrooms <= 0) {
      errors.bedrooms = true;
      isValid = false;
    }
    if (beds <= 0) {
      errors.beds = true;
      isValid = false;
    }
    if (price <= 0) {
      errors.price = true;
      isValid = false;
    }
    if (!location) {
      errors.location = true;
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize Google Maps when map is loaded
  useEffect(() => {
    if (!mapLoaded) return;

    const initMap = () => {
      const mapElement = document.getElementById("location-map");
      if (!mapElement) return;

      // Default center (can be changed based on user's location or a default location)
      const defaultCenter = location
        ? { lat: location.latitude, lng: location.longitude }
        : { lat: 28.6139, lng: 77.209 }; // Default to Delhi, India

      const map = new window.google.maps.Map(mapElement, {
        center: defaultCenter,
        zoom: location ? 15 : 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Store map reference
      mapElement._map = map;

      // Add marker only if location is selected
      let marker = null;
      if (location) {
        marker = new window.google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: map,
          title: "Selected Location",
          draggable: true,
        });
        // Store marker reference
        mapElement._marker = marker;
      }

      // Handle map clicks
      map.addListener("click", async (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        try {
          const address = await reverseGeocodeAddress(lat, lng);
          setLocation({ latitude: lat, longitude: lng, address });
          setUseCurrentLocation(false); // User manually selected location
        } catch {
          setToast({
            type: "error",
            text: "Failed to get address for selected location",
          });
          setTimeout(() => setToast(null), 3000);
        }
      });

      // Handle marker drag (only if marker exists)
      if (marker) {
        marker.addListener("dragend", async (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          try {
            const address = await reverseGeocodeAddress(lat, lng);
            setLocation({ latitude: lat, longitude: lng, address });
            setUseCurrentLocation(false); // User manually selected location
          } catch {
            setToast({
              type: "error",
              text: "Failed to get address for selected location",
            });
            setTimeout(() => setToast(null), 3000);
          }
        });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [mapLoaded, location]);

  // Update map when location changes
  useEffect(() => {
    if (!mapLoaded) return;

    const updateMap = () => {
      const mapElement = document.getElementById("location-map");
      if (!mapElement) return;

      // Find existing map instance
      const map = mapElement._map;
      if (!map) return;

      if (location) {
        // Update map center and add/update marker
        map.setCenter({ lat: location.latitude, lng: location.longitude });
        map.setZoom(15);

        // Remove existing marker if any
        if (mapElement._marker) {
          mapElement._marker.setMap(null);
        }

        // Add new marker
        const marker = new window.google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: map,
          title: "Selected Location",
          draggable: true,
        });

        // Store marker reference
        mapElement._marker = marker;

        // Add drag listener
        marker.addListener("dragend", async (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          try {
            const address = await reverseGeocodeAddress(lat, lng);
            setLocation({ latitude: lat, longitude: lng, address });
            setUseCurrentLocation(false);
          } catch {
            setToast({
              type: "error",
              text: "Failed to get address for selected location",
            });
            setTimeout(() => setToast(null), 3000);
          }
        });
      } else {
        // Remove marker if no location
        if (mapElement._marker) {
          mapElement._marker.setMap(null);
          mapElement._marker = null;
        }
      }
    };

    const timer = setTimeout(updateMap, 100);
    return () => clearTimeout(timer);
  }, [location, mapLoaded]);

  // Close state dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStateDropdown) {
        const target = event.target as Element;
        if (!target.closest(".state-dropdown-container")) {
          setShowStateDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStateDropdown]);

  // Location detection functions
  const reverseGeocodeAddress = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    try {
      if (GOOGLE_KEY) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data?.status === "OK" && data.results?.[0]) {
            return data.results[0].formatted_address;
          }
        }
      }
    } catch {}

    // Fallback to OpenStreetMap
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = await res.json();
        return data?.display_name || `${latitude}, ${longitude}`;
      }
    } catch {}

    return `${latitude}, ${longitude}`;
  };

  const handleDetectCurrentLocation = async () => {
    if (locationLoading) return;
    setLocationLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      const address = await reverseGeocodeAddress(latitude, longitude);

      setLocation({ latitude, longitude, address });
      setUseCurrentLocation(true);
    } catch {
      setToast({ type: "error", text: "Failed to detect current location" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLocationLoading(false);
    }
  };

  const isValid = useMemo(() => {
    return (
      guests > 0 &&
      bedrooms >= 0 &&
      beds >= 0 &&
      locksAllBedrooms !== null &&
      placeType.length > 0 &&
      address.city.trim().length > 0 &&
      address.state.trim().length > 0 &&
      address.pin.trim().length >= 4 &&
      price > 0 &&
      location !== null
    );
  }, [
    guests,
    bedrooms,
    beds,
    locksAllBedrooms,
    placeType,
    address,
    price,
    location,
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Let's start with the basics
      </h1>

      {/* Debug info */}
      {userId && (
        <div className="mb-6 rounded bg-green-100 px-3 py-2 text-sm text-green-800">
          ✅ Logged in as user: {userId}
        </div>
      )}
      {!userId && (
        <div className="mb-6 rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          ❌ No user ID found - please log in again
        </div>
      )}

      {/* Property type */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Which of these best describes your place?
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setPlaceType(type);
                if (fieldErrors.placeType) {
                  setFieldErrors((prev) => ({ ...prev, placeType: false }));
                }
              }}
              className={`rounded-xl border px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                placeType === type
                  ? "border-rose-500 bg-rose-50"
                  : fieldErrors.placeType
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
            >
              <div className="font-medium text-gray-900">{type}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Address SECOND */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Confirm your address</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Country/region
            </label>
            <input
              value={address.country}
              onChange={(e) => {
                setAddress({ ...address, country: e.target.value });
                if (fieldErrors.country) {
                  setFieldErrors((prev) => ({ ...prev, country: false }));
                }
              }}
              className={`w-full rounded-lg border px-3 py-2 ${
                fieldErrors.country ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="India - IN"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Flat, house, etc. (optional)
            </label>
            <input
              value={address.unit}
              onChange={(e) => setAddress({ ...address, unit: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder="31"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Street address
            </label>
            <input
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nearby landmark (optional)
            </label>
            <input
              value={address.landmark}
              onChange={(e) =>
                setAddress({ ...address, landmark: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder="Landmark"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              District/locality (optional)
            </label>
            <input
              value={address.district}
              onChange={(e) =>
                setAddress({ ...address, district: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder="Locality"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">City/town</label>
            <input
              value={address.city}
              onChange={(e) => {
                setAddress({ ...address, city: e.target.value });
                if (fieldErrors.city) {
                  setFieldErrors((prev) => ({ ...prev, city: false }));
                }
              }}
              className={`w-full rounded-lg border px-3 py-2 ${
                fieldErrors.city ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="City"
            />
          </div>
          <div className="state-dropdown-container relative">
            <label className="mb-1 block text-sm font-medium">State/UT</label>
            <div className="relative">
              <input
                type="text"
                value={address.state || stateSearchTerm}
                onChange={(e) => {
                  setStateSearchTerm(e.target.value);
                  setShowStateDropdown(true);
                  if (!e.target.value) {
                    setAddress({ ...address, state: "" });
                  }
                  if (fieldErrors.state) {
                    setFieldErrors((prev) => ({ ...prev, state: false }));
                  }
                }}
                onFocus={() => setShowStateDropdown(true)}
                className={`w-full rounded-lg border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-rose-500 ${
                  fieldErrors.state ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Search or select State/UT"
              />
              <button
                type="button"
                onClick={() => setShowStateDropdown(!showStateDropdown)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className={`h-5 w-5 transition-transform ${
                    showStateDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Dropdown */}
            {showStateDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {filteredStates.length > 0 ? (
                  filteredStates.map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => {
                        setAddress({ ...address, state });
                        setStateSearchTerm("");
                        setShowStateDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      {state}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No states found
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">PIN code</label>
            <input
              value={address.pin}
              onChange={(e) => setAddress({ ...address, pin: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder="PIN code"
            />
          </div>
        </div>
      </section>

      {/* Basics + Bathrooms (compact side-by-side) */}
      <section className="mt-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Basics */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">
              How many people can stay here?
            </h2>
            <div className="space-y-2">
              <Counter
                label="Guests"
                value={guests}
                onChange={setGuests}
                min={1}
              />
              <Counter
                label="Bedrooms"
                value={bedrooms}
                onChange={setBedrooms}
              />
              <Counter label="Beds" value={beds} onChange={setBeds} />
            </div>
            <div className="mt-4 rounded-xl border border-gray-200 p-3">
              <p className="mb-2 text-gray-900">
                Does every bedroom have a lock?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLocksAllBedrooms(true)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    locksAllBedrooms === true
                      ? "bg-rose-500 text-white"
                      : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setLocksAllBedrooms(false)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    locksAllBedrooms === false
                      ? "bg-rose-500 text-white"
                      : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">
              What kind of bathrooms are available to guests?
            </h2>
            <div className="space-y-2">
              <BathroomCounterRow
                title="Private and attached"
                description="Connected to the guest’s room and just for them."
                value={bathsPrivate}
                onChange={setBathsPrivate}
              />
              <BathroomCounterRow
                title="Dedicated"
                description="Private, but accessed via a shared space like a hallway."
                value={bathsDedicated}
                onChange={setBathsDedicated}
              />
              <BathroomCounterRow
                title="Shared"
                description="Shared with other people."
                value={bathsShared}
                onChange={setBathsShared}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Who else might be there? */}
      <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-semibold">
          Who else might be there?
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          Guests need to know whether they’ll encounter other people during
          their stay.
        </p>
        <SelectableGrid
          options={["Me", "My family", "Other guests", "Flatmates/housemates"]}
          selected={whoThere}
          onChange={setWhoThere}
        />
      </section>

      {/* Guest favourites */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-semibold">
          Tell guests what your place has to offer
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          You can add more amenities after you publish your listing.
        </p>
        <h3 className="mb-3 text-base font-semibold">
          What about these guest favourites?
        </h3>
        <SelectableGrid
          options={[
            "Wifi",
            "TV",
            "Kitchen",
            "Washing machine",
            "Free parking on premises",
            "Paid parking on premises",
            "Air conditioning",
            "Dedicated workspace",
          ]}
          selected={amenitiesFav}
          onChange={setAmenitiesFav}
          cols={3}
        />
      </section>

      {/* Standout amenities */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">
          Do you have any standout amenities?
        </h3>
        <SelectableGrid
          options={[
            "Pool",
            "Hot tub",
            "Patio",
            "BBQ grill",
            "Outdoor dining area",
            "Firepit",
            "Pool table",
            "Indoor fireplace",
            "Piano",
            "Exercise equipment",
            "Lake access",
            "Beach access",
            "Ski-in/out",
            "Outdoor shower",
          ]}
          selected={amenitiesStandout}
          onChange={setAmenitiesStandout}
          cols={3}
        />
      </section>

      {/* Safety items */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">
          Do you have any of these safety items?
        </h3>
        <SelectableGrid
          options={[
            "Smoke alarm",
            "First aid kit",
            "Fire extinguisher",
            "Carbon monoxide alarm",
          ]}
          selected={safetyItems}
          onChange={setSafetyItems}
          cols={3}
        />
      </section>

      {/* Photos uploader */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-semibold">
          Add some photos of your place
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          You&apos;ll need 5 photos to get started. You can add more or make
          changes later.
        </p>
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-4 w-full max-w-3xl rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                const compress = (file: File) =>
                  new Promise<string>((resolve, reject) => {
                    const img = new Image();
                    const url = URL.createObjectURL(file);
                    img.onload = () => {
                      const canvas = document.createElement("canvas");
                      const maxW = 1600;
                      const scale = Math.min(1, maxW / img.width);
                      canvas.width = Math.round(img.width * scale);
                      canvas.height = Math.round(img.height * scale);
                      const ctx = canvas.getContext("2d");
                      if (!ctx) return reject(new Error("no ctx"));
                      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                      URL.revokeObjectURL(url);
                      resolve(dataUrl);
                    };
                    img.onerror = () => reject(new Error("image load error"));
                    img.src = url;
                  });
                try {
                  const dataUrls = await Promise.all(files.map(compress));
                  setPhotos((prev) => [...prev, ...dataUrls]);
                } catch {
                  const readers = files.map(
                    (file) =>
                      new Promise<string>((resolve, reject) => {
                        const fr = new FileReader();
                        fr.onload = () => resolve(String(fr.result));
                        fr.onerror = () => reject(fr.error);
                        fr.readAsDataURL(file);
                      })
                  );
                  Promise.all(readers)
                    .then((dataUrls) =>
                      setPhotos((prev) => [...prev, ...dataUrls])
                    )
                    .catch(() => {});
                }
              }}
              id="photos-input"
            />
            <label
              htmlFor="photos-input"
              className="inline-flex cursor-pointer items-center rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
            >
              Add photos
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-3">
              {photos.map((src, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl border"
                >
                  <img
                    src={src}
                    alt={`photo-${idx}`}
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 hidden rounded-full bg-white/90 px-2 py-1 text-xs shadow group-hover:block"
                    onClick={() =>
                      setPhotos((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Price */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-semibold">Set your price</h2>
        <p className="mb-6 text-sm text-gray-600">
          You can change this anytime
        </p>
        <div className="max-w-md">
          <label className="mb-2 block text-sm font-medium">
            Price per night (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              ₹
            </span>
            <input
              type="number"
              value={price || ""}
              onChange={(e) => {
                setPrice(Number(e.target.value));
                if (fieldErrors.price) {
                  setFieldErrors((prev) => ({ ...prev, price: false }));
                }
              }}
              className={`w-full rounded-lg border pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 ${
                fieldErrors.price ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-semibold">
          Where&apos;s your place located?
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Your address is only shared with guests after they&apos;ve made a
          reservation
        </p>

        <div className="space-y-4">
          {/* Current Location Option */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="use-current-location"
              checked={useCurrentLocation}
              onChange={(e) => {
                setUseCurrentLocation(e.target.checked);
                if (e.target.checked) {
                  handleDetectCurrentLocation();
                } else {
                  setLocation(null);
                }
                if (fieldErrors.location) {
                  setFieldErrors((prev) => ({ ...prev, location: false }));
                }
              }}
              className="h-4 w-4 text-rose-600 focus:ring-rose-500"
            />
            <label
              htmlFor="use-current-location"
              className="text-sm font-medium"
            >
              Use my current location
            </label>
            {locationLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-rose-500"></div>
            )}
          </div>

          {/* Location Display */}
          {location && (
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Selected Location:
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {location.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLocation(null);
                    setUseCurrentLocation(false);
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
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
            </div>
          )}

          {/* Interactive Google Maps */}
          {mapLoaded && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                {location
                  ? "Click on the map to select a different location:"
                  : "Click on the map to select your location:"}
              </p>
              <div className="relative">
                <div
                  id="location-map"
                  className={`h-64 w-full rounded-lg border ${
                    fieldErrors.location ? "border-red-500" : "border-gray-200"
                  }`}
                  style={{ minHeight: "256px" }}
                />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-rose-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual Location Input */}
          {!useCurrentLocation && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Search for your location
                </label>
                <input
                  type="text"
                  placeholder="Enter address or search for a place"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      const query = e.currentTarget.value;
                      if (query.trim()) {
                        // Simple geocoding - in a real app, you'd use Google Places API
                        setToast({
                          type: "error",
                          text: "Please use &apos;Use my current location&apos; for now",
                        });
                        setTimeout(() => setToast(null), 3000);
                      }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                For now, please use the &quot;Use my current location&quot;
                option above
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="sticky bottom-0 mt-8 flex items-center justify-between border-t bg-white/80 px-2 py-4 backdrop-blur">
        <button
          type="button"
          className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={() => router.back()}
        >
          Back
        </button>
        <button
          type="button"
          disabled={!isValid}
          className="rounded-full bg-rose-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={async () => {
            // Validate form first
            if (!validateForm()) {
              setToast({
                type: "error",
                text: "Please fill all required fields correctly",
              });
              setTimeout(() => setToast(null), 3000);
              return;
            }

            // Check if userId is set
            if (!userId) {
              console.log("❌ No userId available for listing creation");
              setToast({
                type: "error",
                text: "User not authenticated. Please log in again.",
              });
              setTimeout(() => setToast(null), 3000);
              return;
            }

            // Debug: Show current values
            console.log("🔍 Current form values:");
            console.log("  userId:", userId);
            console.log("  price:", price);
            console.log("  location:", location);
            console.log("  placeType:", placeType);
            console.log("  address:", address);

            // If any images are base64 data URLs, upload them first and get permanent URLs
            let uploadedUrls: string[] = photos;
            try {
              if (photos.some((p) => p.startsWith("data:"))) {
                const upRes = await fetch("/api/files", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ files: photos }),
                });
                const upData = await upRes.json();
                if (!upRes.ok) throw new Error(upData.error || "Upload failed");
                uploadedUrls = upData.urls as string[];
              }
            } catch {
              setToast({ type: "error", text: "Image upload failed" });
              setTimeout(() => setToast(null), 3000);
              return;
            }
            const payload = {
              userId,
              placeType,
              guests,
              bedrooms,
              beds,
              locksAllBedrooms: Boolean(locksAllBedrooms),
              bathrooms: {
                privateAttached: bathsPrivate,
                dedicated: bathsDedicated,
                shared: bathsShared,
              },
              whoThere,
              amenitiesFav,
              amenitiesStandout,
              safetyItems,
              address,
              photos: uploadedUrls,
              price,
              location,
            };

            console.log("Creating listing with payload:", payload);
            console.log("userId being sent:", userId);
            console.log("price being sent:", price);
            console.log("location being sent:", location);
            console.log("Full payload JSON:", JSON.stringify(payload, null, 2));

            if (!userId) {
              setToast({
                type: "error",
                text: "User not authenticated. Please log in again.",
              });
              setTimeout(() => setToast(null), 3000);
              return;
            }

            try {
              const res = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = await res.json();
              if (res.ok) {
                setToast({
                  type: "success",
                  text: "Listing saved successfully! Redirecting to home...",
                });
                setTimeout(() => {
                  setToast(null);
                  router.push("/");
                }, 2000);
              } else {
                setToast({
                  type: "error",
                  text: data.error || "Failed to save",
                });
                setTimeout(() => setToast(null), 3000);
              }
            } catch {
              setToast({ type: "error", text: "Network error" });
              setTimeout(() => setToast(null), 3000);
            }
          }}
        >
          Next
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[100] rounded-xl px-4 py-3 text-sm shadow-lg ring-1 backdrop-blur ${
            toast.type === "success"
              ? "bg-white/90 text-gray-900 ring-green-300"
              : "bg-white/90 text-gray-900 ring-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                toast.type === "success" ? "bg-green-500" : "bg-rose-500"
              }`}
            />
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </main>
  );
}

type BathroomCounterRowProps = {
  title: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
};
function BathroomCounterRow({
  title,
  description,
  value,
  onChange,
}: BathroomCounterRowProps) {
  return (
    <div className="flex items-center justify-between border-b py-3 last:border-b-0">
      <div className="mr-4">
        <div className="font-medium text-gray-900">{title}</div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <InlineCounter value={value} onChange={onChange} />
    </div>
  );
}

type SelectableGridProps = {
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
  cols?: number;
};
function SelectableGrid({
  options,
  selected,
  onChange,
  cols = 2,
}: SelectableGridProps) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((v) => v !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };
  return (
    <div
      className={`grid grid-cols-1 gap-3 sm:grid-cols-${cols} lg:grid-cols-${cols}`}
    >
      {options.map((opt) => {
        const isActive = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-xl border px-4 py-4 text-left transition ${
              isActive
                ? "border-rose-500 bg-rose-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="font-medium text-gray-900">{opt}</div>
          </button>
        );
      })}
    </div>
  );
}
type InlineCounterProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};
function InlineCounter({
  value,
  onChange,
  min = 0,
  max = 50,
}: InlineCounterProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="decrease"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:bg-gray-50 active:scale-95"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-semibold text-gray-900">
        {value}
      </span>
      <button
        type="button"
        aria-label="increase"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:bg-gray-50 active:scale-95"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
}
