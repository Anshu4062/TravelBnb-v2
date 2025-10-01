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
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/listings");
        const data = await res.json();
        if (Array.isArray(data)) setListings(data);
      } catch {}
    })();
  }, []);
  return (
    <>
      <Navbar />
      <Header />

      {/* Popular homes in Varanasi */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 animate-fade-in">
        <h2 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
          {t("homePopularInCity")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[
            { img: "/hall.jpg", title: "Cozy lounge" },
            { img: "/room.jpg", title: "Minimalist room" },
            { img: "/roomBlue.jpg", title: "Blue room" },
            { img: "/sofa.jpg", title: "Modern sofa" },
          ].map((card, idx) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-gray-200 animate-slide-up"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium">{card.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {listings.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 animate-fade-in">
          <h2 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {t("homeRecentlyHosted")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
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
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
                      {t("noImage")}
                    </div>
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

      {/* Available this weekend */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 animate-fade-in">
        <h2 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
          {t("homeAvailableThisWeekend")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              img: "/hallRoom.jpg",
              title: "Spacious hall room",
              price: "$120 night",
            },
            {
              img: "/roomWithDesk.jpg",
              title: "Room with desk",
              price: "$95 night",
            },
            {
              img: "/sofaAndTV.jpg",
              title: "Living space with TV",
              price: "$140 night",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-gray-200 animate-slide-up"
            >
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-base font-semibold">{card.title}</p>
                <p className="mt-1 text-sm text-gray-600">{card.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
