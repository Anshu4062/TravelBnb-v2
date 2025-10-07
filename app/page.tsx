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
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const { t } = useLanguage();
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let city: string | null = null;
        try {
          city = localStorage.getItem("currentCity");
          setCity(city);
        } catch {}
        const url = city
          ? `/api/listings?city=${encodeURIComponent(city)}`
          : "/api/listings";
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data)) setListings(data);
      } catch {}
    })();
  }, []);

  return (
    <>
      <Navbar />
      <Header />

      {listings.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-10 animate-fade-in">
          <h2 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {city ? `${t("popularHomesIn")} ${city}` : t("homePopularInCity")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {listings.slice(0, 4).map((l) => (
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
                  <p className="text-sm font-medium">{l.placeType}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {l.address?.city || ""} {l.address?.state || ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {listings.length > 4 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 animate-fade-in">
          <h2 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {t("homeAvailableThisWeekend")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(4, 13).map((l) => (
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
                  <p className="text-base font-semibold">{l.placeType}</p>
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


