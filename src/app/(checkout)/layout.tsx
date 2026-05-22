import Navbar from "@components/layout/navbar";
import { ReactNode } from "react";
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="block lg:hidden">
        <Navbar />
      </div>
      <main className="mx-auto w-full bg-white dark:bg-neutral-950 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </>
  );
}
