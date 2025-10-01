import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";

const Header = () => {
  const [locationQuery, setLocationQuery] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const whereRef = useRef<HTMLDivElement | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const checkInRef = useRef<HTMLDivElement | null>(null);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [currentMonthOut, setCurrentMonthOut] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const checkOutRef = useRef<HTMLDivElement | null>(null);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement | null>(null);
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0, pets: 0 });
  const { t } = useLanguage();

  type LocationItem = {
    id: number;
    title: string;
    subtitle: string;
    icon: "nearby" | "city" | "suburb" | "landmark" | "beach" | "mountain" | "nature" | "office" | "garden";
    bg: string;
    text: string;
  };

  const suggestedLocations: LocationItem[] = [
    { id: 0, title: "Nearby", subtitle: "Find stays near you", icon: "nearby", bg: "bg-rose-100", text: "text-rose-700" },
    { id: 1, title: "New Delhi, Delhi", subtitle: "For sights like India Gate", icon: "city", bg: "bg-green-100", text: "text-green-700" },
    { id: 2, title: "Noida, Uttar Pradesh", subtitle: "Popular with travellers near you", icon: "suburb", bg: "bg-pink-100", text: "text-pink-700" },
    { id: 3, title: "Jaipur, Rajasthan", subtitle: "For its stunning architecture", icon: "landmark", bg: "bg-blue-100", text: "text-blue-700" },
    { id: 4, title: "North Goa, Goa", subtitle: "Popular beach destination", icon: "beach", bg: "bg-amber-100", text: "text-amber-700" },
    { id: 5, title: "Nainital, Uttarakhand", subtitle: "Known for its lakes", icon: "mountain", bg: "bg-rose-100", text: "text-rose-700" },
    { id: 6, title: "Manali, Himachal Pradesh", subtitle: "For nature lovers", icon: "nature", bg: "bg-rose-100", text: "text-rose-700" },
    { id: 7, title: "Gurgaon, Haryana", subtitle: "Business hubs and stays", icon: "office", bg: "bg-pink-100", text: "text-pink-700" },
    { id: 8, title: "Mumbai, Maharashtra", subtitle: "City that never sleeps", icon: "city", bg: "bg-blue-100", text: "text-blue-700" },
    { id: 9, title: "Bengaluru, Karnataka", subtitle: "Garden city getaways", icon: "garden", bg: "bg-green-100", text: "text-green-700" },
  ];

  const renderIcon = (icon: LocationItem["icon"]) => {
    switch (icon) {
      case "nearby":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
            <path fillRule="evenodd" d="M12 1.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5Zm0 15a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm8.25-4.5a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM7.5 12a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 7.5 12Z" clipRule="evenodd" />
          </svg>
        );
      case "city":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h6a.75.75 0 0 1 .75.75v16.5H3.75V4.5ZM12.75 9A.75.75 0 0 1 13.5 8.25h6a.75.75 0 0 1 .75.75v12H12.75V9Z" />
            <path d="M6 6.75h3v2.25H6V6.75ZM6 11.25h3v2.25H6v-2.25ZM15 10.5h3v2.25h-3V10.5ZM15 14.25h3V16.5h-3v-2.25Z" />
          </svg>
        );
      case "suburb":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l7.07 7.06a.75.75 0 0 1 0 1.06v7.04H4.5v-7.04a.75.75 0 0 1 0-1.06l6.97-6.97Z" />
          </svg>
        );
      case "landmark":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 3 4.5 6.75V9H19.5V6.75L12 3ZM6 10.5h12v1.5H6v-1.5ZM6 13.5h12V15H6v-1.5ZM4.5 16.5H19.5V18H4.5v-1.5Z" />
          </svg>
        );
      case "beach":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M4.5 18.75c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1V21c-1.5 0-1.5-1-3-1s-1.5 1-3 1-1.5-1-3-1-1.5 1-3 1-1.5-1-3-1V18.75Z" />
            <path d="M13.5 10.5c0-3.314-2.686-6-6-6-.621 0-1.222.094-1.785.268A6 6 0 0 1 13.5 10.5Zm0 0H9l4.5 6" />
          </svg>
        );
      case "mountain":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3 20.25 10.5 7.5l3 5.25 2.25-3.75L21 20.25H3Z" />
          </svg>
        );
      case "nature":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 2.25a4.5 4.5 0 0 0-4.5 4.5c0 2.07 1.43 3.8 3.36 4.33V21h2.28v-9.92A4.5 4.5 0 0 0 16.5 6.75 4.5 4.5 0 0 0 12 2.25Z" />
          </svg>
        );
      case "office":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M6 3.75h7.5v16.5H6V3.75ZM15.75 8.25H21v12H15.75v-12Z" />
            <path d="M8.25 6.75h2.25V9H8.25V6.75ZM8.25 10.5h2.25v2.25H8.25V10.5Z" />
          </svg>
        );
      case "garden":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 3.75c-2.9 0-5.25 2.35-5.25 5.25S9.1 14.25 12 14.25s5.25-2.35 5.25-5.25S14.9 3.75 12 3.75Zm-1.5 11.25h3v5.25h-3V15Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const filteredLocations = suggestedLocations.filter(({ title }) =>
    title.toLowerCase().includes(locationQuery.trim().toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (whereRef.current && !whereRef.current.contains(target)) {
        setIsLocationOpen(false);
      }
      if (checkInRef.current && !checkInRef.current.contains(target)) {
        setIsCheckInOpen(false);
      }
      if (checkOutRef.current && !checkOutRef.current.contains(target)) {
        setIsCheckOutOpen(false);
      }
      if (guestsRef.current && !guestsRef.current.contains(target)) {
        setIsGuestsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatMonthYear = (date: Date) =>
    date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstWeekday = (date: Date) => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    return first.getDay(); // 0-6 Sun-Sat
  };

  const addMonths = (date: Date, count: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + count);
    return d;
  };
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center rounded-full border border-gray-100 bg-white p-2 shadow-sm transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-gray-200 md:p-3">
            <div ref={whereRef} className="relative flex flex-1 items-center gap-2 rounded-full px-4 py-2 hover:bg-gray-50">
              <div className="flex w-32 flex-col">
                <span className="text-xs font-semibold tracking-wide uppercase text-gray-900">
                  {t("where")}
                </span>
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
                  placeholder={t("searchDestinations")}
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onFocus={() => setIsLocationOpen(true)}
                />
              </div>
              {isLocationOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 w-[28rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                  <div className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-900">
                    {t("where")}
                  </div>
                  <ul className="max-h-72 overflow-auto">
                    {(filteredLocations.length ? filteredLocations : suggestedLocations).map(
                      (loc) => (
                        <li
                          key={loc.id}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setLocationQuery(loc.title);
                            setIsLocationOpen(false);
                          }}
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${loc.bg} ${loc.text}`}>
                            {renderIcon(loc.icon)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">{loc.title}</p>
                            <p className="truncate text-xs text-gray-500">{loc.subtitle}</p>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="hidden h-8 w-px bg-gray-300 md:block" />
            <div ref={checkInRef} className="relative hidden flex-1 items-center gap-2 rounded-full px-4 py-2 transition-colors hover:bg-gray-50 md:flex">
              <div className="flex w-28 flex-col">
                <span className="text-xs font-semibold tracking-wide uppercase text-gray-900">
                  {t("checkIn")}
                </span>
                <button
                  className="w-full text-left text-sm text-gray-500"
                  onClick={() => setIsCheckInOpen(true)}
                >
                  {checkInDate
                    ? checkInDate.toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                      })
                    : t("addDates")}
                </button>
              </div>
              {isCheckInOpen && (
                <div
                  className="absolute left-1/2 top-full z-20 mt-2 w-[52rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between px-2 pb-2">
                    <div className="flex gap-2 rounded-full bg-gray-100 p-1 text-xs font-medium text-gray-700">
                      <button className="rounded-full bg-white px-3 py-1 shadow">{t("datesLabel")}</button>
                      <button className="rounded-full px-3 py-1">{t("monthsLabel")}</button>
                      <button className="rounded-full px-3 py-1">{t("flexibleLabel")}</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="Previous month"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M14.53 5.47a.75.75 0 0 1 0 1.06L10.06 11l4.47 4.47a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 0Z" />
                        </svg>
                      </button>
                      <button
                        aria-label="Next month"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M9.47 18.53a.75.75 0 0 1 0-1.06L13.94 13 9.47 8.53a.75.75 0 0 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 px-2 pb-4">
                    {[0, 1].map((offset) => {
                      const monthDate = addMonths(currentMonth, offset);
                      const days = getDaysInMonth(monthDate);
                      const firstWd = getFirstWeekday(monthDate);
                      const blanks = Array.from({ length: firstWd });
                      const dates = Array.from({ length: days }, (_, i) => i + 1);
                      return (
                        <div key={offset} className="w-full">
                          <div className="mb-3 text-center text-sm font-semibold text-gray-900">
                            {formatMonthYear(monthDate)}
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
                            {['S','M','T','W','T','F','S'].map((d) => (
                              <div key={d} className="py-1">{d}</div>
                            ))}
                          </div>
                          <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
                            {blanks.map((_, i) => (
                              <div key={`b-${i}`} className="py-2" />
                            ))}
                            {dates.map((d) => {
                              const dateObj = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
                              const isSelected = checkInDate && dateObj.toDateString() === checkInDate.toDateString();
                              const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                              return (
                                <button
                                  key={d}
                                  disabled={isPast}
                                  onClick={() => {
                                    setCheckInDate(dateObj);
                                    setIsCheckInOpen(false);
                                  }}
                                  className={`h-9 w-9 place-self-center rounded-full transition-colors ${
                                    isSelected ? "bg-rose-500 text-white" : isPast ? "text-gray-300" : "hover:bg-gray-100"
                                  }`}
                                >
                                  {d}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 px-2">
                    {[
                      t("exactDates"),
                      "± 1 day",
                      "± 2 days",
                      "± 3 days",
                      "± 7 days",
                      "± 14 days",
                    ].map((label, i) => (
                      <button key={i} className={`rounded-full border px-3 py-1 text-xs ${i===0 ? "border-gray-900" : "border-gray-300"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden h-8 w-px bg-gray-300 md:block" />
            <div ref={checkOutRef} className="relative hidden flex-1 items-center gap-2 rounded-full px-4 py-2 transition-colors hover:bg-gray-50 md:flex">
              <div className="flex w-28 flex-col">
                <span className="text-xs font-semibold tracking-wide uppercase text-gray-900">
                  {t("checkOut")}
                </span>
                <button
                  className="w-full text-left text-sm text-gray-500"
                  onClick={() => setIsCheckOutOpen(true)}
                >
                  {checkOutDate
                    ? checkOutDate.toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                      })
                    : t("addDates")}
                </button>
              </div>
              {isCheckOutOpen && (
                <div
                  className="absolute left-1/2 top-full z-20 mt-2 w-[52rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between px-2 pb-2">
                    <div className="flex gap-2 rounded-full bg-gray-100 p-1 text-xs font-medium text-gray-700">
                      <button className="rounded-full bg-white px-3 py-1 shadow">{t("datesLabel")}</button>
                      <button className="rounded-full px-3 py-1">{t("monthsLabel")}</button>
                      <button className="rounded-full px-3 py-1">{t("flexibleLabel")}</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="Previous month"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
                        onClick={() => setCurrentMonthOut(addMonths(currentMonthOut, -1))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M14.53 5.47a.75.75 0 0 1 0 1.06L10.06 11l4.47 4.47a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 0Z" />
                        </svg>
                      </button>
                      <button
                        aria-label="Next month"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
                        onClick={() => setCurrentMonthOut(addMonths(currentMonthOut, 1))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M9.47 18.53a.75.75 0 0 1 0-1.06L13.94 13 9.47 8.53a.75.75 0 0 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 px-2 pb-4">
                    {[0, 1].map((offset) => {
                      const monthDate = addMonths(currentMonthOut, offset);
                      const days = getDaysInMonth(monthDate);
                      const firstWd = getFirstWeekday(monthDate);
                      const blanks = Array.from({ length: firstWd });
                      const dates = Array.from({ length: days }, (_, i) => i + 1);
                      return (
                        <div key={offset} className="w-full">
                          <div className="mb-3 text-center text-sm font-semibold text-gray-900">
                            {formatMonthYear(monthDate)}
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
                            {['S','M','T','W','T','F','S'].map((d) => (
                              <div key={d} className="py-1">{d}</div>
                            ))}
                          </div>
                          <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
                            {blanks.map((_, i) => (
                              <div key={`b-o-${i}`} className="py-2" />
                            ))}
                            {dates.map((d) => {
                              const dateObj = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
                              const isSelected = checkOutDate && dateObj.toDateString() === checkOutDate.toDateString();
                              const minDate = checkInDate ? new Date(checkInDate.setHours(0,0,0,0)) : new Date(new Date().setHours(0,0,0,0));
                              const isPast = dateObj < minDate;
                              return (
                                <button
                                  key={d}
                                  disabled={isPast}
                                  onClick={() => {
                                    setCheckOutDate(dateObj);
                                    setIsCheckOutOpen(false);
                                  }}
                                  className={`h-9 w-9 place-self-center rounded-full transition-colors ${
                                    isSelected ? "bg-rose-500 text-white" : isPast ? "text-gray-300" : "hover:bg-gray-100"
                                  }`}
                                >
                                  {d}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 px-2">
                    {[
                      t("exactDates"),
                      "± 1 day",
                      "± 2 days",
                      "± 3 days",
                      "± 7 days",
                      "± 14 days",
                    ].map((label, i) => (
                      <button key={i} className={`rounded-full border px-3 py-1 text-xs ${i===0 ? "border-gray-900" : "border-gray-300"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden h-8 w-px bg-gray-300 md:block" />
            <div ref={guestsRef} className="relative flex flex-1 items-center gap-2 rounded-full px-4 py-2 transition-colors hover:bg-gray-50">
              <div className="flex w-28 flex-col">
                <span className="text-xs font-semibold tracking-wide uppercase text-gray-900">
                  {t("who")}
                </span>
                <button
                  className="w-full text-left text-sm text-gray-500"
                  onClick={() => setIsGuestsOpen(true)}
                >
                  {(() => {
                    const total = guests.adults + guests.children + guests.infants + guests.pets;
                    return total > 0 ? `${total} guest${total > 1 ? "s" : ""}` : t("addGuests");
                  })()}
                </button>
              </div>
              {isGuestsOpen && (
                <div className="absolute left-1/2 top-full z-20 mt-2 w-[32rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl" onMouseDown={(e) => e.preventDefault()}>
                  {[
                    { key: "adults", title: t("adults"), subtitle: t("ages13Plus") },
                    { key: "children", title: t("children"), subtitle: t("ages2to12") },
                    { key: "infants", title: t("infants"), subtitle: t("under2") },
                    { key: "pets", title: t("pets"), subtitle: t("serviceAnimal") },
                  ].map((row, i) => (
                    <div key={row.key} className={`flex items-center justify-between ${i !== 0 ? "border-t" : ""} border-gray-200 py-4`}>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{row.title}</div>
                        <div className="text-xs text-gray-500">{row.subtitle}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          aria-label="decrease"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 disabled:opacity-40"
                          onClick={() => setGuests((g) => ({ ...g, [row.key]: Math.max(0, (g as any)[row.key] - 1) }))}
                          disabled={(guests as any)[row.key] === 0}
                        >
                          –
                        </button>
                        <div className="w-5 text-center text-sm text-gray-900">{(guests as any)[row.key]}</div>
                        <button
                          aria-label="increase"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700"
                          onClick={() => setGuests((g) => ({ ...g, [row.key]: (g as any)[row.key] + 1 }))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 text-right">
                    <button className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white" onClick={() => setIsGuestsOpen(false)}>{t("done")}</button>
                  </div>
                </div>
              )}
              <button className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white transition-transform duration-200 hover:scale-105 active:scale-95 md:h-12 md:w-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 md:h-6 md:w-6"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 1 0 4.21 12.06l3.99 3.99a.75.75 0 1 0 1.06-1.06l-3.99-3.99A6.75 6.75 0 0 0 10.5 3.75Zm-5.25 6.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;
