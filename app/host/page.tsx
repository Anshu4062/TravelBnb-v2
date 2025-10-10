"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { useRTL } from "@/app/components/RTLProvider";
import { loadGoogleMaps, isGoogleMapsReady } from "@/lib/googleMaps";

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

const PROPERTY_TYPE_KEYS = [
  "house",
  "flatApartment",
  "barn",
  "bedAndBreakfast",
  "boat",
  "cabin",
  "campervanMotorhome",
  "casaParticular",
  "castle",
  "cave",
  "container",
  "cycladicHome",
  "dammuso",
  "dome",
  "earthHome",
  "farm",
  "guestHouse",
  "hotel",
  "houseboat",
  "riad",
  "ryokan",
  "shepherdsHut",
  "tent",
  "tinyHome",
  "tower",
  "treeHouse",
  "trullo",
  "windmill",
  "yurt",
];

export default function HostPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isRTL } = useRTL();
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
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [stateSearchTerm, setStateSearchTerm] = useState<string>("");
  const [showStateDropdown, setShowStateDropdown] = useState<boolean>(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Debug useEffect to track checkbox state changes
  useEffect(() => {
    console.log('useCurrentLocation state changed:', useCurrentLocation);
  }, [useCurrentLocation]);

  // Function to get current location and reverse geocode
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      // Disabled error popup - just return silently
      // setToast({
      //   type: "error",
      //   text: "Geolocation is not supported by your browser",
      // });
      // setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const addressComponents = result.address_components;

            // Extract address components
            let city = "";
            let state = "";
            let country = "";
            let pin = "";
            let street = "";
            let district = "";

            addressComponents.forEach((component: any) => {
              if (component.types.includes("locality")) {
                city = component.long_name;
              } else if (component.types.includes("administrative_area_level_3") && !city) {
                city = component.long_name;
              } else if (component.types.includes("administrative_area_level_1")) {
                state = component.long_name;
              } else if (component.types.includes("country")) {
                country = component.long_name;
              } else if (component.types.includes("postal_code")) {
                pin = component.long_name;
              } else if (component.types.includes("route")) {
                street = component.long_name;
              } else if (component.types.includes("sublocality") || component.types.includes("administrative_area_level_2")) {
                district = component.long_name;
              }
            });

            // Update address fields
            setAddress({
              ...address,
              city: city,
              state: state,
              country: country ? `${country}` : address.country,
              pin: pin,
              street: street,
              district: district,
            });

            // Update map location
            setLocation({
              latitude,
              longitude,
              address: result.formatted_address,
            });

            setToast({
              type: "success",
              text: "Location detected successfully!",
            });
            setTimeout(() => setToast(null), 3000);
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          // Disabled error popup - just log the error silently
          // setToast({
          //   type: "error",
          //   text: "Failed to get address from location",
          // });
          // setTimeout(() => setToast(null), 3000);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoadingLocation(false);
        // Don't reset the checkbox state on error - let user decide
        // setUseCurrentLocation(false);
        
        // Disabled error popup - just log the error silently
        // let errorMessage = "Failed to get your location";
        // if (error.code === error.PERMISSION_DENIED) {
        //   errorMessage = "Location permission denied. Please enable location access.";
        // } else if (error.code === error.POSITION_UNAVAILABLE) {
        //   errorMessage = "Location information unavailable";
        // } else if (error.code === error.TIMEOUT) {
        //   errorMessage = "Location request timed out";
        // }
        
        // setToast({
        //   type: "error",
        //   text: errorMessage,
        // });
        // setTimeout(() => setToast(null), 3000);
      }
    );
  };

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
    if (!address.city.trim()) {
      errors.city = true;
      isValid = false;
    }
    if (!address.state.trim()) {
      errors.state = true;
      isValid = false;
    }
    if (guests <= 0) {
      errors.guests = true;
      isValid = false;
    }
    if (bedrooms < 0) {
      errors.bedrooms = true;
      isValid = false;
    }
    if (beds < 0) {
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
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMaps();
        setMapLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    };

    initializeGoogleMaps();
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
           setToast({
             type: "success",
             text: "Location selected successfully!",
           });
           setTimeout(() => setToast(null), 2000);
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


  const isValid = useMemo(() => {
    return (
      guests > 0 &&
      bedrooms >= 0 &&
      beds >= 0 &&
      locksAllBedrooms !== null &&
      placeType.length > 0 &&
      address.city.trim().length > 0 &&
      address.state.trim().length > 0 &&
      price > 0 &&
      location !== null
    );
  }, [
    guests,
    bedrooms,
    beds,
    locksAllBedrooms,
    placeType,
    address.city,
    address.state,
    price,
    location,
  ]);

  return (
    <main className={`mx-auto w-full max-w-5xl px-4 py-10 ${isRTL ? 'rtl' : 'ltr'}`}>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        {t("letsStartWithBasics")}
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
          {t("whichBestDescribesYourPlace")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_TYPE_KEYS.map((typeKey) => (
            <button
              key={typeKey}
              type="button"
              onClick={() => {
                setPlaceType(typeKey);
                if (fieldErrors.placeType) {
                  setFieldErrors((prev) => ({ ...prev, placeType: false }));
                }
              }}
              className={`rounded-xl border px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                placeType === typeKey
                  ? "border-rose-500 bg-rose-50"
                  : fieldErrors.placeType
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
            >
              <div className="font-medium text-gray-900">{t(typeKey)}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Address SECOND */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{t("confirmYourAddress")}</h2>
        
        {/* Use Current Location Checkbox */}
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="relative">
            <input
              type="checkbox"
              id="useCurrentLocation"
              checked={useCurrentLocation}
              onChange={(e) => {
                const checked = e.target.checked;
                setUseCurrentLocation(checked);
                if (checked) {
                  getCurrentLocation();
                }
              }}
              disabled={loadingLocation}
              className="sr-only"
            />
            <div 
              className={`h-4 w-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                useCurrentLocation 
                  ? 'bg-white border-green-500' 
                  : 'bg-white border-gray-300 hover:border-rose-300'
              } ${loadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (!loadingLocation) {
                  const newChecked = !useCurrentLocation;
                  console.log('Checkbox clicked, new state:', newChecked);
                  setUseCurrentLocation(newChecked);
                  if (newChecked) {
                    // Add a small delay to ensure state is set before calling geolocation
                    setTimeout(() => {
                      getCurrentLocation();
                    }, 100);
                  }
                }
              }}
            >
              {useCurrentLocation && (
                <svg
                  className="h-3 w-3 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          <label
            htmlFor="useCurrentLocation"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-rose-500"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            {loadingLocation ? "Detecting your location..." : "Use my current location"}
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              {t("countryRegion")}
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
              {t("flatHouseOptional")}
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
              {t("streetAddress")}
            </label>
            <input
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder={t("streetAddress")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("nearbyLandmarkOptional")}
            </label>
            <input
              value={address.landmark}
              onChange={(e) =>
                setAddress({ ...address, landmark: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder={t("landmark")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("districtLocalityOptional")}
            </label>
            <input
              value={address.district}
              onChange={(e) =>
                setAddress({ ...address, district: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder={t("locality")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t("cityTown")}</label>
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
              placeholder={t("city")}
            />
          </div>
          <div className="state-dropdown-container relative">
            <label className="mb-1 block text-sm font-medium">{t("stateUT")}</label>
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
                placeholder={t("searchOrSelectStateUT")}
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
                        if (fieldErrors.state) {
                          setFieldErrors((prev) => ({ ...prev, state: false }));
                        }
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
            <label className="mb-1 block text-sm font-medium">{t("pinCode")} (Optional)</label>
            <input
              value={address.pin}
              onChange={(e) => setAddress({ ...address, pin: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder={t("pinCode")}
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
              {t("howManyPeopleCanStay")}
            </h2>
            <div className="space-y-2">
              <Counter
                label={t("guests")}
                value={guests}
                onChange={setGuests}
                min={1}
              />
              <Counter
                label={t("bedrooms")}
                value={bedrooms}
                onChange={setBedrooms}
              />
              <Counter label={t("beds")} value={beds} onChange={setBeds} />
            </div>
            <div className="mt-4 rounded-xl border border-gray-200 p-3">
              <p className="mb-2 text-gray-900">
                {t("doesEveryBedroomHaveLock")}
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
                  {t("yes")}
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
                  {t("no")}
                </button>
              </div>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">
              {t("whatKindOfBathroomsAvailable")}
            </h2>
            <div className="space-y-2">
              <BathroomCounterRow
                title={t("privateAndAttached")}
                description={t("connectedToGuestRoom")}
                value={bathsPrivate}
                onChange={setBathsPrivate}
              />
              <BathroomCounterRow
                title={t("dedicated")}
                description={t("privateButAccessedViaSharedSpace")}
                value={bathsDedicated}
                onChange={setBathsDedicated}
              />
              <BathroomCounterRow
                title={t("shared")}
                description={t("sharedWithOtherPeople")}
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
          {t("whoElseMightBeThere")}
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          {t("guestsNeedToKnowEncounterOthers")}
        </p>
        <SelectableGrid
          options={[t("me"), t("myFamily"), t("otherGuests"), t("flatmatesHousemates")]}
          selected={whoThere}
          onChange={setWhoThere}
        />
      </section>

      {/* Guest favourites */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-semibold">
          {t("tellGuestsWhatYourPlaceHasToOffer")}
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          {t("canAddMoreAmenitiesAfterPublish")}
        </p>
        <h3 className="mb-3 text-base font-semibold">
          {t("whatAboutTheseGuestFavourites")}
        </h3>
        <SelectableGrid
          options={[
            t("wifi"),
            t("tv"),
            t("kitchen"),
            t("washingMachine"),
            t("freeParkingOnPremises"),
            t("paidParkingOnPremises"),
            t("airConditioning"),
            t("dedicatedWorkspace"),
          ]}
          selected={amenitiesFav}
          onChange={setAmenitiesFav}
          cols={3}
        />
      </section>

      {/* Standout amenities */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">
          {t("doYouHaveAnyStandoutAmenities")}
        </h3>
        <SelectableGrid
          options={[
            t("pool"),
            t("hotTub"),
            t("patio"),
            t("bbqGrill"),
            t("outdoorDiningArea"),
            t("firepit"),
            t("poolTable"),
            t("indoorFireplace"),
            t("piano"),
            t("exerciseEquipment"),
            t("lakeAccess"),
            t("beachAccess"),
            t("skiInOut"),
            t("outdoorShower"),
          ]}
          selected={amenitiesStandout}
          onChange={setAmenitiesStandout}
          cols={3}
        />
      </section>

      {/* Safety items */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">
          {t("doYouHaveAnyOfTheseSafetyItems")}
        </h3>
        <SelectableGrid
          options={[
            t("smokeAlarm"),
            t("firstAidKit"),
            t("fireExtinguisher"),
            t("carbonMonoxideAlarm"),
          ]}
          selected={safetyItems}
          onChange={setSafetyItems}
          cols={3}
        />
      </section>

      {/* Photos uploader */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-semibold">
          {t("addSomePhotosOfYourPlace")}
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          {t("need5PhotosToGetStarted")}
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
              {t("addPhotos")}
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
                    {t("remove")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Price */}
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-semibold">{t("setYourPrice")}</h2>
        <p className="mb-6 text-sm text-gray-600">
          {t("canChangeThisAnytime")}
        </p>
        <div className="max-w-md">
          <label className="mb-2 block text-sm font-medium">
            {t("pricePerNight")}
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
          {t("whereIsYourPlaceLocated")}
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          {t("addressOnlySharedAfterReservation")}
        </p>

         <div className="space-y-4">

          {/* Location Display */}
          {location && (
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {t("selectedLocation")}:
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {location.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("coordinates")}: {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
                  </p>
                </div>
                 <button
                   type="button"
                   onClick={() => {
                     setLocation(null);
                     if (fieldErrors.location) {
                       setFieldErrors((prev) => ({ ...prev, location: false }));
                     }
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
                  ? t("clickOnMapToSelectDifferentLocation")
                  : t("clickOnMapToSelectYourLocation")}
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
                      <p className="text-sm text-gray-600">{t("loadingMap")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

           {/* Manual Location Input */}
           <div className="space-y-4">
             <div>
               <label className="mb-2 block text-sm font-medium">
                 {t("searchForYourLocation")}
               </label>
               <input
                 type="text"
                 placeholder={t("enterAddressOrSearchForPlace")}
                 className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
                 onKeyDown={async (e) => {
                   if (e.key === "Enter") {
                     const query = e.currentTarget.value;
                     if (query.trim()) {
                       // Simple geocoding - in a real app, you'd use Google Places API
                       setToast({
                         type: "error",
                         text: "Please use the map to select your location",
                       });
                       setTimeout(() => setToast(null), 3000);
                     }
                   }
                 }}
               />
             </div>
             <p className="text-xs text-gray-500">
               {t("forNowPleaseUseCurrentLocationOption")}
             </p>
           </div>
        </div>
      </section>

      {/* Actions */}
      <div className="sticky bottom-0 mt-8 flex items-center justify-between border-t bg-white/80 px-2 py-4 backdrop-blur">
        <button
          type="button"
          className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={() => router.back()}
        >
          {t("back")}
        </button>
        <button
          type="button"
          disabled={!isValid || submitting}
          className="rounded-full bg-rose-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={async () => {
            if (submitting) return;
            
            // Prevent double submission
            setSubmitting(true);
            
            // Validate form first
            if (!validateForm()) {
              setToast({
                type: "error",
                text: "Please fill all required fields correctly",
              });
              setTimeout(() => setToast(null), 3000);
              setSubmitting(false);
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
              setSubmitting(false);
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
                // Trigger event to refresh listings on home page
                console.log("Dispatching listingCreated event...");
                window.dispatchEvent(new CustomEvent('listingCreated'));
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
                setSubmitting(false);
              }
            } catch {
              setToast({ type: "error", text: "Network error" });
              setTimeout(() => setToast(null), 3000);
              setSubmitting(false);
            }
          }}
        >
          {submitting ? t("saving") : t("next")}
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
