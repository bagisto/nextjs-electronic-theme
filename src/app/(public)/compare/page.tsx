import CompareClient from "@/components/compare/CompareClient";
import Breadcrumb from "@/components/common/Breadcrumb";

export const metadata = {
  title: "Product Comparison - Bagisto",
  description: "Compare multiple products side by side to choose the best one for you.",
};

export default function ComparePage() {
  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 py-6">
        <Breadcrumb items={[
          { name: "Home", href: "/" },
          { name: "Compare", href: "/compare" },
        ]} />
        <CompareClient />
      </div>
    </div>
  );
}
