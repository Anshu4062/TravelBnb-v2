"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";

const Navbar = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState<boolean>(false);
  const [lastCoords, setLastCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationSource, setLocationSource] = useState<"gps" | "ip" | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const { t, setLocale, locale } = useLanguage();
  const [languageLabel, setLanguageLabel] = useState<string>("English");
  const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as
    | string
    | undefined;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) setUserName(u.name as string);
      }
      const savedCity = localStorage.getItem("currentCity");
      if (savedCity) setCity(savedCity);
      const savedLang = localStorage.getItem("languageLabel");
      if (savedLang) setLanguageLabel(savedLang);
      const savedLat = localStorage.getItem("currentLat");
      const savedLon = localStorage.getItem("currentLon");
      if (savedLat && savedLon) {
        const latitude = parseFloat(savedLat);
        const longitude = parseFloat(savedLon);
        if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
          setLastCoords({ latitude, longitude });
        }
      }
    } catch {}
  }, []);

  // Re-localize detected city name when language changes
  useEffect(() => {
    const relocalize = async () => {
      if (lastCoords) {
        const name = await reverseGeocodeCity(lastCoords.latitude, lastCoords.longitude);
        if (name) {
          setCity(name);
          try {
            localStorage.setItem("currentCity", name);
          } catch {}
        }
      }
    };
    // Avoid running on first render if city is null and we don't have coords
    relocalize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as Element;
        if (!target.closest(".user-menu-container")) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // IP-based detection removed as per request; GPS-only path below

  const reverseGeocodeCity = async (
    latitude: number,
    longitude: number
  ): Promise<string | null> => {
    // Try Google first
    try {
      if (GOOGLE_KEY) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_KEY}&language=${locale}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data?.status === "OK" && Array.isArray(data.results)) {
            const first = data.results[0];
            const components: Array<{
              long_name: string;
              short_name: string;
              types: string[];
            }> = first?.address_components || [];

            const findType = (type: string) =>
              components.find((c) => c.types?.includes(type))?.long_name ||
              null;

            const locality = findType("locality");
            const admin1 = findType("administrative_area_level_1");
            const country = findType("country");
            const name = locality || admin1 || country || null;
            if (name) return name;
          }
        }
      }
    } catch {}

    // Fallback to OpenStreetMap Nominatim (no key required)
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
      const res = await fetch(url, { headers: { Accept: "application/json", "Accept-Language": locale } });
      if (!res.ok) return null;
      const data = await res.json();
      const addr = data?.address || {};
      const city =
        addr.city || addr.town || addr.village || addr.hamlet || null;
      const admin1 = addr.state || null;
      const country = addr.country || null;
      return city || admin1 || country || null;
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentCity");
    localStorage.removeItem("currentLat");
    localStorage.removeItem("currentLon");
    localStorage.removeItem("languageLabel");
    setUserName(null);
    setCity(null);
    setLastCoords(null);
    setLanguageLabel("English");
    setShowUserMenu(false);
    window.location.href = "/";
  };

  const handleSelectLanguage = (label: string, loc: "en" | "hi" | "kn" | "mr") => {
    try {
      localStorage.setItem("languageLabel", label);
    } catch {}
    setLanguageLabel(label);
    setLocale(loc);
    setShowLanguageModal(false);
  };

  const handleDetectLocation = async () => {
    if (locLoading) return;
    setLocLoading(true);
    try {
      const requestPreciseLocation = async (): Promise<{
        latitude: number;
        longitude: number;
      } | null> => {
        try {
          // Check permission state first if supported
          type NavigatorWithPermissions = Navigator & {
            permissions?: {
              query: (d: PermissionDescriptor) => Promise<PermissionStatus>;
            };
          };
          const navWithPerms = navigator as NavigatorWithPermissions;
          const canQueryPerms =
            typeof navigator !== "undefined" &&
            !!navWithPerms.permissions &&
            typeof navWithPerms.permissions.query === "function";
          if (canQueryPerms) {
            try {
              const status = await navWithPerms.permissions!.query({
                name: "geolocation",
              } as PermissionDescriptor);
              if (status.state === "denied") {
                setLocationError("Geolocation permission denied by browser");
                return null;
              }
            } catch {}
          }

          // First attempt: getCurrentPosition
          const pos1: GeolocationPosition = await new Promise(
            (resolve, reject) => {
              if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
                return;
              }
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
              });
            }
          );
          return {
            latitude: pos1.coords.latitude,
            longitude: pos1.coords.longitude,
          };
        } catch {
          // Second attempt: watchPosition for fresh GPS lock
          try {
            const pos2: GeolocationPosition = await new Promise(
              (resolve, reject) => {
                if (!navigator.geolocation) {
                  reject(new Error("Geolocation not supported"));
                  return;
                }
                const watchId = navigator.geolocation.watchPosition(
                  (p) => {
                    navigator.geolocation.clearWatch(watchId);
                    resolve(p);
                  },
                  (err) => {
                    navigator.geolocation.clearWatch(watchId);
                    reject(err);
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0,
                  }
                );
              }
            );
            return {
              latitude: pos2.coords.latitude,
              longitude: pos2.coords.longitude,
            };
          } catch {
            setLocationError("watchPosition failed or timed out");
            return null;
          }
        }
      };

      // 1) Try precise browser geolocation first (more accurate)
      const precise = await requestPreciseLocation();
      if (precise) {
        const preciseCity = await reverseGeocodeCity(
          precise.latitude,
          precise.longitude
        );
        if (preciseCity) {
          setCity(preciseCity);
          setLocationSource("gps");
          setLocationError(null);
          console.log("Location source: GPS", precise);
          try {
            localStorage.setItem("currentCity", preciseCity);
            localStorage.setItem("currentLat", String(precise.latitude));
            localStorage.setItem("currentLon", String(precise.longitude));
          } catch {}
          setLastCoords({ latitude: precise.latitude, longitude: precise.longitude });
          return; // Done
        }
      }

      // No IP fallback. If we reach here, GPS failed.
      setLocationSource(null);
      if (!locationError) {
        setLocationError("GPS unavailable or permission denied");
      }
    } catch {
      setLocationError("Unexpected error while detecting location");
    } finally {
      setLocLoading(false);
    }
  };
  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 transition-all duration-300 md:h-20 md:px-6">
        {/* Left: Brand */}
        <div className="flex items-center">
          <Link
            href="/"
            className="select-none text-xl font-semibold tracking-tight md:text-2xl"
          >
            TravelBnb
          </Link>
        </div>

        {/* Middle: Navigation Tabs */}
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-full px-6 py-3 text-base font-medium text-gray-900 bg-gray-100 transition-all duration-200 hover:bg-gray-200 hover:shadow-sm active:scale-95">
            {t("homes")}
          </button>
          <button className="rounded-full px-6 py-3 text-base font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm active:scale-95">
            {t("experiences")}
          </button>
          <button className="rounded-full px-6 py-3 text-base font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm active:scale-95">
            {t("services")}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 md:gap-2 animate-fade-in">
          <Link
            href={userName ? "/host" : "/login"}
            className="hidden rounded-full px-6 py-3 text-base font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm active:scale-95 md:block"
          >
            {t("host")}
          </Link>
          {city ? (
            <button
              onClick={handleDetectLocation}
              className="rounded-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              title={`Detected location via ${locationSource ?? "unknown"}$${
                locationError ? " | " + locationError : ""
              }`}
            >
              {city}
            </button>
          ) : (
            <button
              onClick={handleDetectLocation}
              className="rounded-full p-3 hover:bg-gray-100"
              title={t("detectLocation")}
            >
              {locLoading ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6 animate-spin text-gray-700"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.25"
                  />
                  <path
                    d="M22 12a10 10 0 0 1-10 10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.75"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-gray-700"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-3.728 0-6.75 3.022-6.75 6.75 0 4.5 6.75 12.75 6.75 12.75S18.75 13.5 18.75 9c0-3.728-3.022-6.75-6.75-6.75Zm0 10.5a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
          {userName ? (
            <div className="user-menu-container relative flex items-center gap-3">
              {/* User Profile with Initial - Clickable */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white text-base font-medium transition-transform duration-200 hover:scale-105"
              >
                {userName.charAt(0).toUpperCase()}
              </button>

              {/* Language Button with Tooltip and Notification Dot */}
              <button
                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-transform duration-200 hover:scale-105"
                title={`Language: ${languageLabel}`}
                onClick={() => setShowLanguageModal(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25C6.615 2.25 2.25 6.615 2.25 12S6.615 21.75 12 21.75 21.75 17.385 21.75 12 17.385 2.25 12 2.25Zm-.75 1.6c-2.068.3-3.8 2.63-4.27 5.9h4.27V3.85Zm1.5 0v5.9h4.27c-.47-3.27-2.202-5.6-4.27-5.9Zm-1.5 7.4H6.98c.13 1.35.49 2.58 1.03 3.6.7 1.31 1.62 2.1 2.74 2.29V11.25Zm1.5 0v6.79c1.12-.19 2.04-.98 2.74-2.29.54-1.02.9-2.25 1.03-3.6H12.75Zm-1.5 8.19v1.86c-2.068-.3-3.8-2.63-4.27-5.9h4.27Zm1.5 1.86v-1.86h4.27c-.47 3.27-2.202 5.6-4.27 5.9Z"
                    clipRule="evenodd"
                  />
                </svg>
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {languageLabel}
                </div>
                {/* Notification Dot */}
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-gray-200 bg-white shadow-lg animate-fade-in">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        window.location.href = "/my-listings";
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                      </svg>
                      {t("editHostedPlaces")}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9a.75.75 0 0 0 1.5 0V5.25a1.5 1.5 0 0 1 1.5-1.5h6Z"
                          clipRule="evenodd"
                        />
                        <path
                          fillRule="evenodd"
                          d="M12.75 12a.75.75 0 0 0-.75-.75H4.027l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72H12a.75.75 0 0 0 .75-.75Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-full border border-gray-200 p-1 pl-3 transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 text-gray-700"
                aria-hidden="true"
              >
                <path d="M3.75 7.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Z" />
              </svg>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-white transition-transform duration-200 group-hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 2.25a5.25 5.25 0 0 0-3.712 9.028 8.253 8.253 0 0 0-4.79 7.121.75.75 0 0 0 1.5 0 6.75 6.75 0 0 1 13.5 0 .75.75 0 0 0 1.5 0 8.253 8.253 0 0 0-4.79-7.121A5.25 5.25 0 0 0 12 2.25Zm0 1.5a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Z" />
                </svg>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
    {showLanguageModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setShowLanguageModal(false)}
        ></div>
        <div className="relative z-[61] max-h-[80vh] w-[90vw] max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex gap-6 text-sm font-medium">
              <span className="text-gray-900">{t("languageAndRegion")}</span>
              <span className="text-gray-400">{t("currency")}</span>
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Close language selector"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-gray-700"><path fillRule="evenodd" d="M6.72 6.72a.75.75 0 0 1 1.06 0L12 10.94l4.22-4.22a.75.75 0 1 1 1.06 1.06L13.06 12l4.22 4.22a.75.75 0 1 1-1.06 1.06L12 13.06l-4.22 4.22a.75.75 0 1 1-1.06-1.06L10.94 12 6.72 7.78a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 overflow-y-auto px-5 py-5 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">{t("suggestedLanguagesRegions")}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: "English — United States", loc: "en" },
                  { label: "English — United Kingdom", loc: "en" },
                  { label: "हिन्दी — भारत", loc: "hi" },
                  { label: "ಕನ್ನಡ — ಭಾರತ", loc: "kn" },
                  { label: "मराठी — भारत", loc: "mr" },
                ].map(({ label, loc }) => (
                  <button
                    key={label}
                    onClick={() => handleSelectLanguage(label, loc as any)}
                    className={`flex items-start justify-between rounded-xl border px-4 py-3 text-left text-sm transition hover:border-gray-300 hover:bg-gray-50 ${
                      languageLabel === label ? "border-gray-900" : "border-gray-200"
                    }`}
                  >
                    <span className="text-gray-900">{label}</span>
                    {languageLabel === label && (
                      <span className="ml-3 mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">{t("chooseLanguageRegion")}</h3>
              <div className="grid max-h-[45vh] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {[
                  { label: "English — India", loc: "en" },
                  { label: "Azərbaycan dili — Azərbaycan", loc: "en" },
                  { label: "Bahasa Indonesia — Indonesia", loc: "en" },
                  { label: "Bosanski — Bosna i Hercegovina", loc: "en" },
                  { label: "Català — Espanya", loc: "en" },
                  { label: "Čeština — Česká republika", loc: "en" },
                  { label: "Crnogorski — Crna Gora", loc: "en" },
                  { label: "Dansk — Danmark", loc: "en" },
                  { label: "Deutsch — Deutschland", loc: "en" },
                  { label: "Deutsch — Österreich", loc: "en" },
                ].map(({ label, loc }) => (
                  <button
                    key={label}
                    onClick={() => handleSelectLanguage(label, loc as any)}
                    className={`flex items-start justify-between rounded-xl border px-4 py-3 text-left text-sm transition hover:border-gray-300 hover:bg-gray-50 ${
                      languageLabel === label ? "border-gray-900" : "border-gray-200"
                    }`}
                  >
                    <span className="text-gray-900">{label}</span>
                    {languageLabel === label && (
                      <span className="ml-3 mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t px-5 py-4">
            <button
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowLanguageModal(false)}
            >
              {t("done")}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;
