import Link from "next/link";
import { Suspense } from "react";
import { isObject } from "@/utils/type-guards";
import { getThemeCustomization } from "@/utils/bagisto-client";
import InstaGramIcon from "@components/common/icons/InstaGramIcon";
import TwitterIcon from "@components/common/icons/TwitterIcon";
import Subscribe from "./Subscribe";
import FooterMenu from "./FooterMenu";
import ServiceContent from "./ServiceContent";
import { ThemeCustomizationTranslationEdge } from "@/types/theme/theme-customization";
import FacebookIcon from "@components/common/icons/FacebookIcon";
const { COMPANY_NAME, SITE_NAME } = process.env;

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2010 + (currentYear > 2010 ? `-${currentYear}` : "");
  const menu = await getThemeCustomization();
  const copyrightName = COMPANY_NAME || SITE_NAME || "";
  const services = menu?.services_content?.themeCustomizations?.edges?.[0]?.node;


  return (
    <>
      {/* Services section */}
      <div className="mx-auto w-full px-4 md:px-6 lg:px-8 py-10 md:py-12 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-screen-2xl mx-auto">
          {isObject(services) && services?.translations?.edges && (
            <ServiceContent
              name={services?.name}
              serviceData={services?.translations?.edges?.map((edge: ThemeCustomizationTranslationEdge) => edge.node)}
            />
          )}
        </div>
      </div>

      {/* Main footer */}
      <footer className="hidden lg:block bg-neutral-50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300">
        <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-8 py-12 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Brand Section */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <Link
                className="flex items-center gap-2 cursor-pointer w-fit"
                href="/"
                aria-label="Go to homepage"
                title="Go to homepage"
              >
                <div className="flex items-center gap-x-2">
                  <div className="!min-h-8 !min-w-8 flex items-center justify-center rounded-lg bg-emerald-500">
                    <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4.40234" y="8.07141" width="21.004" height="21.2374" className="fill-white" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M17.7392 3.94898C16.1961 2.40592 13.6943 2.40592 12.1513 3.94898C11.1758 4.92448 10.6277 6.24754 10.6277 7.6271V11.3387C10.6277 11.9187 10.1576 12.3889 9.57754 12.3889C8.99753 12.3889 8.52734 11.9187 8.52734 11.3387V7.6271C8.52734 5.69048 9.29666 3.83317 10.6661 2.46378C13.0294 0.100453 16.8611 0.100453 19.2244 2.46378C20.5938 3.83317 21.3631 5.69047 21.3631 7.62709V11.3387C21.3631 11.9187 20.8929 12.3889 20.3129 12.3889C19.7329 12.3889 19.2627 11.9187 19.2627 11.3387V7.62709C19.2627 6.24754 18.7147 4.92448 17.7392 3.94898Z" className="fill-white" />
                      <rect x="4.40234" y="25.8081" width="21.004" height="3.50067" className="fill-white" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">Logoipsum</p>
                </div>
                <span className="sr-only">Go to homepage</span>
              </Link>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-[260px]">
                Premium products with exceptional quality. Your satisfaction is our priority.
              </p>
              <div className="flex gap-3 mt-1">
                <Link
                  href={"#"}
                  aria-label="Visit on Facebook"
                  title="Facebook"
                  target="_blank"
                  className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-900 transition-all duration-200"
                >
                  <FacebookIcon />
                </Link>
                <Link
                  href={"#"}
                  aria-label="Visit on Instagram"
                  title="Instagram"
                  target="_blank"
                  className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-900 transition-all duration-200"
                >
                  <InstaGramIcon />
                </Link>
                <Link
                  href={"#"}
                  aria-label="Visit on Twitter"
                  title="Twitter"
                  target="_blank"
                  className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-900 transition-all duration-200"
                >
                  <TwitterIcon />
                </Link>
              </div>
            </div>

            {/* Footer Menu */}
            <div className="lg:col-span-5">
              <Suspense
                fallback={
                  <div className="flex flex-col gap-3">
                    {Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <div key={index} className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-32 animate-pulse" />
                      ))}
                  </div>
                }
              >
                <FooterMenu menu={menu?.footer_links?.themeCustomizations?.edges} />
              </Suspense>
            </div>

            {/* Newsletter Section */}
            <div className="lg:col-span-4">
              <Subscribe />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 py-4">
          <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-neutral-400 dark:text-neutral-500">
            <p>
              &copy; {copyrightDate} {copyrightName}
              {copyrightName.length && !copyrightName.endsWith(".")
                ? "."
                : ""}{" "}
              All rights reserved.
            </p>
            <p>Powered by Bagisto</p>
          </div>
        </div>
      </footer>
    </>
  );
}
