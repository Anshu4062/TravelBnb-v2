"use client";

import { useLanguage } from "@/app/components/LanguageProvider";

const Footer = () => {
  const { t, locale } = useLanguage();

  const localeDisplay: Record<string, string> = {
    en: "English (IN)",
    hi: "हिन्दी (IN)",
    kn: "ಕನ್ನಡ (IN)",
    mr: "मराठी (IN)",
  };
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 items-start gap-y-8 gap-x-10 text-sm text-gray-700 sm:grid-cols-2 md:grid-cols-4 md:gap-x-16 lg:gap-x-24">
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">{t("support")}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("helpCenter")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("airCover")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("antiDiscrimination")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("disabilitySupport")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">{t("hosting")}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("travelBnbYourHome")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("airCoverForHosts")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("hostingResources")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("communityForum")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">{t("travelBnbBrand")}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("newsroom")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("investors")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("careers")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("giftCards")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">{t("discover")}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("homes")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("experiences")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("services")}
                </a>
              </li>
              <li>
                <a
                  className="inline-block rounded py-0.5 transition-colors hover:bg-gray-100 hover:underline"
                  href="#"
                >
                  {t("topRatedStays")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-gray-600 md:flex-row">
          <p>© {new Date().getFullYear()} TravelBnb, Inc.</p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:underline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25C6.615 2.25 2.25 6.615 2.25 12S6.615 21.75 12 21.75 21.75 17.385 21.75 12 17.385 2.25 12 2.25Zm-.75 1.6c-2.068.3-3.8 2.63-4.27 5.9h4.27V3.85Zm1.5 0v5.9h4.27c-.47-3.27-2.202-5.6-4.27-5.9Zm-1.5 7.4H6.98c.13 1.35.49 2.58 1.03 3.6.7 1.31 1.62 2.1 2.74 2.29V11.25Zm1.5 0v6.79c1.12-.19 2.04-.98 2.74-2.29.54-1.02.9-2.25 1.03-3.6H12.75Zm-1.5 8.19v1.86c-2.068-.3-3.8-2.63-4.27-5.9h4.27Zm1.5 1.86v-1.86h4.27c-.47 3.27-2.202 5.6-4.27 5.9Z"
                  clipRule="evenodd"
                />
              </svg>
              {localeDisplay[locale]}
            </button>
            <button className="rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:underline">
              ₹ INR
            </button>
            <div className="mx-2 h-4 w-px bg-gray-300" />
            <a
              className="rounded px-1 py-0.5 transition-colors hover:bg-gray-100 hover:underline"
              href="#"
            >
              {t("privacy")}
            </a>
            <a
              className="rounded px-1 py-0.5 transition-colors hover:bg-gray-100 hover:underline"
              href="#"
            >
              {t("terms")}
            </a>
            <a
              className="rounded px-1 py-0.5 transition-colors hover:bg-gray-100 hover:underline"
              href="#"
            >
              {t("sitemap")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
