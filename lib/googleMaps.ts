// Centralized Google Maps loader to prevent multiple script loads
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  console.log("🔍 loadGoogleMaps called - isGoogleMapsLoaded:", isGoogleMapsLoaded, "isGoogleMapsLoading:", isGoogleMapsLoading);
  
  // If already loaded, return resolved promise
  if (isGoogleMapsLoaded && window.google?.maps) {
    console.log("✅ Google Maps already loaded, returning resolved promise");
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isGoogleMapsLoading && loadPromise) {
    console.log("⏳ Google Maps currently loading, returning existing promise");
    return loadPromise;
  }

  // Start loading
  console.log("🚀 Starting to load Google Maps API...");
  isGoogleMapsLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      isGoogleMapsLoading = false;
      console.log("✅ Google Maps API loaded successfully");
      resolve();
    };
    
    script.onerror = () => {
      isGoogleMapsLoading = false;
      console.error("❌ Failed to load Google Maps API");
      reject(new Error("Failed to load Google Maps API"));
    };
    
    document.head.appendChild(script);
  });

  return loadPromise;
};

export const isGoogleMapsReady = (): boolean => {
  return isGoogleMapsLoaded && !!window.google?.maps;
};
