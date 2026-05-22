import { ReactNode } from "react";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <Navbar />
      <div className="mx-auto min-h-[calc(100vh-580px)] w-full bg-white dark:bg-neutral-950">
        {children}
      </div>
      <Footer />
    </main>
  );
}
