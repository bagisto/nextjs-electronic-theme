import CompareClient from "@/components/compare/CompareClient";

export const metadata = {
  title: "Product Comparison - Bagisto",
  description: "Compare multiple products side by side to choose the best one for you.",
};

export default function ComparePage() {
  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen">
      <CompareClient />
    </div>
  );
}
