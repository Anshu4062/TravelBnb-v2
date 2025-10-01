"use client";
import { useEffect, useRef, useState, use as useUnwrap } from "react";
import type { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import { useLanguage } from "@/app/components/LanguageProvider";

type Listing = {
  _id: string;
  placeType: string;
  photos?: string[];
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: { privateAttached: number; dedicated: number; shared: number };
  locksAllBedrooms: boolean;
  address?: { city?: string; state?: string };
  amenitiesFav?: string[];
  amenitiesStandout?: string[];
  safetyItems?: string[];
  price?: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
};

export default function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = useUnwrap(params);
  const { t } = useLanguage();
  const [listing, setListing] = useState<Listing | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [petCount, setPetCount] = useState(0);
  const guestMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (!guestMenuRef.current) return;
      if (!guestMenuRef.current.contains(e.target as Node)) {
        setIsGuestMenuOpen(false);
      }
    };
    if (isGuestMenuOpen) document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [isGuestMenuOpen]);

  useEffect(() => {
    setGuestCount(adultCount + childCount);
  }, [adultCount, childCount]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const ms = end.getTime() - start.getTime();
    const diff = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const openGalleryAt = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => setIsGalleryOpen(false);
  const showPrev = () => {
    if (!listing?.photos?.length) return;
    setCurrentPhotoIndex((i) => (i - 1 + listing.photos!.length) % listing.photos!.length);
  };
  const showNext = () => {
    if (!listing?.photos?.length) return;
    setCurrentPhotoIndex((i) => (i + 1) % listing.photos!.length);
  };

  const pluralize = (count: number, singular: string, plural?: string) =>
    `${singular}${count === 1 ? "" : plural ? plural : "s"}`;

  useEffect(() => {
    if (!isGalleryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "Escape") closeGallery();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isGalleryOpen, listing]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        if (data && !data.error) setListing(data);
      } catch {}
    })();
  }, [id]);

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

  // Initialize map when listing and map are loaded
  useEffect(() => {
    if (!mapLoaded || !listing?.location) return;

    const initMap = () => {
      const mapElement = document.getElementById("listing-map");
      if (!mapElement) return;

      const { latitude, longitude, address } = listing!.location!;

      const map = new window.google.maps.Map(mapElement, {
        center: {
          lat: latitude,
          lng: longitude,
        },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Add marker
      new window.google.maps.Marker({
        position: {
          lat: latitude,
          lng: longitude,
        },
        map: map,
        title: address,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [mapLoaded, listing]);

  return (
    <div>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        {!listing ? (
          <p className="text-gray-600">{t("loading")}</p>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">{listing.placeType}</h1>
              <p className="text-gray-600">
                {listing.address?.city || ""} {listing.address?.state || ""}
              </p>
            </div>

            {/* Photo mosaic */}
            {listing.photos && listing.photos.length > 0 && (
              <div className="mb-8 relative">
                <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
                  <div className="col-span-2 row-span-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.photos[0]}
                      alt="photo-0"
                      className="h-full w-full object-cover cursor-pointer"
                      onClick={() => openGalleryAt(0)}
                    />
                  </div>
                  {listing.photos.slice(1, 5).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={`photo-${i + 1}`}
                      className="h-full w-full object-cover cursor-pointer"
                      onClick={() => openGalleryAt(i + 1)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => openGalleryAt(0)}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 backdrop-blur px-4 py-2 text-sm font-medium shadow-md ring-1 ring-gray-300 hover:bg-white"
                >
                  {t("showAllPhotos")}
                </button>
              </div>
            )}

            {/* Overview with reserve sidebar */}
            <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-lg font-semibold">{t("aboutThisPlace")}</h2>
                  <p className="mb-4 text-sm text-gray-600">
                    {listing.guests} {pluralize(listing.guests, "guest")} · {listing.bedrooms} {pluralize(listing.bedrooms, "bedroom")} · {listing.beds} {pluralize(listing.beds, "bed")} · {listing.bathrooms.privateAttached} private {pluralize(listing.bathrooms.privateAttached, "bathroom")}
                  </p>

                  {/* Compact overview removed per request */}

                  {/* Details */}
                  <div className="mt-6 rounded-xl ring-1 ring-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2 font-medium">{t("bathrooms")}</h3>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-sm">
                      <li>
                        {t("privateAttached")}:{" "}
                        {listing.bathrooms.privateAttached}
                      </li>
                      <li>{t("dedicated")}: {listing.bathrooms.dedicated}</li>
                      <li>{t("shared")}: {listing.bathrooms.shared}</li>
                    </ul>
                  </div>

                  <div className="mt-6 rounded-xl ring-1 ring-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2 font-medium">{t("guestFavourites")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenitiesFav?.map((a, i) => (
                        <span
                          key={i}
                          className="rounded-full border px-3 py-1 text-sm"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl ring-1 ring-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2 font-medium">{t("standoutAmenities")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenitiesStandout?.map((a, i) => (
                        <span
                          key={i}
                          className="rounded-full border px-3 py-1 text-sm"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl ring-1 ring-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2 font-medium">{t("safetyItems")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.safetyItems?.map((a, i) => (
                        <span
                          key={i}
                          className="rounded-full border px-3 py-1 text-sm"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {listing.location && (
                    <div className="mt-6 rounded-xl ring-1 ring-gray-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-2 font-medium">{t("locationLabel")}</h3>
                      <p className="mb-3 text-sm text-gray-600">
                        {listing.location.address}
                      </p>
                      <div className="relative">
                        <div
                          id="listing-map"
                          className="h-64 w-full rounded-lg ring-1 ring-gray-200"
                          style={{ minHeight: "256px" }}
                        />
                        {!mapLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                            <div className="text-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-rose-500 mx-auto mb-2"></div>
                              <p className="text-sm text-gray-600">
                                {t("loadingMap")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {t("coordinates")}: {listing.location.latitude.toFixed(6)},{" "}
                        {listing.location.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <aside className="h-max rounded-2xl ring-1 ring-gray-200 bg-white p-5 shadow-sm">
                {listing.price && (
                  <div className="mb-4 text-2xl font-semibold">
                    ₹{listing.price}
                    {nights > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        for {nights} night{nights > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}

                <div className="mb-4 rounded-xl ring-1 ring-gray-200" ref={guestMenuRef}>
                    <div className="grid grid-cols-2 divide-x">
                    <div className="p-3">
                      <div className="text-[10px] font-semibold tracking-wider text-gray-600">{t("checkInCaps")}</div>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="mt-1 w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-semibold tracking-wider text-gray-600">{t("checkoutCaps")}</div>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="mt-1 w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="relative border-t">
                    <button
                      type="button"
                      onClick={() => setIsGuestMenuOpen((o) => !o)}
                      className="flex w-full items-center justify-between p-3"
                    >
                      <div>
                        <div className="text-[10px] font-semibold tracking-wider text-gray-600">{t("guestsCaps")}</div>
                        <div className="mt-1 text-sm">
                          {guestCount} guest{guestCount !== 1 ? "s" : ""}
                          {infantCount > 0 ? `, ${infantCount} infant${infantCount !== 1 ? "s" : ""}` : ""}
                          {petCount > 0 ? `, ${petCount} pet${petCount !== 1 ? "s" : ""}` : ""}
                        </div>
                      </div>
                      <span className={`transition-transform ${isGuestMenuOpen ? "rotate-180" : ""}`}>⌄</span>
                    </button>

                    {isGuestMenuOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border bg-white p-4 shadow-xl">
                        <GuestRow
                          label="Adults"
                          subLabel="Age 13+"
                          value={adultCount}
                          setValue={setAdultCount}
                          min={1}
                        />
                        <GuestRow
                          label="Children"
                          subLabel="Ages 2–12"
                          value={childCount}
                          setValue={setChildCount}
                          min={0}
                        />
                        <GuestRow
                          label="Infants"
                          subLabel="Under 2"
                          value={infantCount}
                          setValue={setInfantCount}
                          min={0}
                        />
                        <GuestRow
                          label="Pets"
                          subLabel="Bringing a service animal?"
                          value={petCount}
                          setValue={setPetCount}
                          min={0}
                        />
                        <p className="mt-3 text-xs text-gray-600">
                          {/* Keeping English sentence for brevity; can be added to dictionary if needed */}
                          This place has a maximum of {listing.guests} guests, not including infants.
                        </p>
                        <div className="mt-3 text-right">
                          <button
                            type="button"
                            onClick={() => setIsGuestMenuOpen(false)}
                            className="text-sm font-medium underline"
                          >
                            {t("close")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button className="w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3 text-white text-base font-semibold transition hover:opacity-95">
                  {t("reserve")}
                </button>
                <p className="mt-3 text-center text-xs text-gray-600">{t("wontBeChargedYet")}</p>
              </aside>
            </section>
          </>
        )}
      </main>

      {/* Fullscreen gallery modal */}
      {isGalleryOpen && listing?.photos && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-white text-sm">
              {currentPhotoIndex + 1} / {listing.photos.length}
            </div>
            <button
              type="button"
              onClick={closeGallery}
              className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium shadow ring-1 ring-gray-300 hover:bg-white"
            >
              Close
            </button>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.photos[currentPhotoIndex]}
                alt={`photo-${currentPhotoIndex}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Left arrow */}
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow ring-1 ring-gray-300 hover:bg-white"
            >
              ‹
            </button>

            {/* Right arrow */}
            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow ring-1 ring-gray-300 hover:bg-white"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-lg font-medium">{value}</div>
    </div>
  );
}

function OverviewStat({
  label,
  value,
  icon,
  subText,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  subText?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
      {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
      <div>
        <div className="text-xs text-gray-600">{label}</div>
        <div className="text-base font-medium leading-5">{value}</div>
        {subText && <div className="mt-0.5 text-[11px] text-gray-500">{subText}</div>}
      </div>
    </div>
  );
}

function GuestRow({
  label,
  subLabel,
  value,
  setValue,
  min,
}: {
  label: string;
  subLabel: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
}) {
  const decrement = () => setValue(Math.max(min, value - 1));
  const increment = () => setValue(value + 1);
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-gray-600">{subLabel}</div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={decrement}
          className="h-8 w-8 rounded-full ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          −
        </button>
        <span className="w-4 text-center">{value}</span>
        <button
          type="button"
          onClick={increment}
          className="h-8 w-8 rounded-full ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
}
