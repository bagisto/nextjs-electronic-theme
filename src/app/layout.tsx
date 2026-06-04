import "./globals.css";
import {
  MainProvider,
  ThemeProvider,
} from "@/providers";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { generateMetadataForPage } from "@utils/helper";
import { staticSeo } from "@utils/metadata";
import { SpeculationRules } from "@components/theme/SpeculationRules";

const bagistoImageOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT
      ? new URL(process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT).origin
      : null;
  } catch {
    return null;
  }
})();

export async function generateMetadata() {
  return generateMetadataForPage("", staticSeo.default);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {bagistoImageOrigin && (
          <>
            <link rel="preconnect" href={bagistoImageOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={bagistoImageOrigin} />
          </>
        )}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  where: {
                    and: [
                      { href_matches: "/*" },
                      { not: { href_matches: "/logout" } },
                      { not: { href_matches: "/*\\?*(^|&)add-to-cart=*" } },
                      { not: { selector_matches: ".no-prerender" } },
                      { not: { selector_matches: "[rel~=nofollow]" } },
                    ],
                  },
                },
              ],
              prefetch: [
                {
                  urls: ["next.html", "next2.html"],
                  requires: ["anonymous-client-ip-when-cross-origin"],
                  referrer_policy: "no-referrer",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen font-archivo text-foreground bg-white dark:bg-neutral-950 antialiased">
        <main className="bg-white dark:bg-neutral-950">
          <ThemeProvider>
            <ErrorBoundary>
              <MainProvider>
                {children}
              </MainProvider>
            </ErrorBoundary>
            <SpeculationRules />
          </ThemeProvider>
        </main>
        <span className="dsv-2025.04.19-7e29" />
      </body>
    </html>
  );
}
