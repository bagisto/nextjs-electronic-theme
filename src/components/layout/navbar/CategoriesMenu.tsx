import Link from "next/link";
import { GET_TREE_CATEGORIES, graphqlRequest } from "@/graphql";
import MobileMenu from "./MobileMenu";

export async function CategoriesMenu() {
  const data = await graphqlRequest<any>(
    GET_TREE_CATEGORIES,
    { parentId: 1 },
    { tags: ["categories"], life: "days" }
  );

  const categories = data?.treeCategories || [];

  const filteredCategories = categories
    .filter((cat: any) => cat.id !== "1")
    .map((cat: any) => {
      const translation = cat.translation;
      return {
        id: cat.id,
        name: translation?.name || "",
        slug: translation?.slug || "",
      };
    })
    .filter((item: any) => item.name && item.slug);

  const menuData = [
    { id: "all", name: "All", slug: "" },
    ...filteredCategories.slice(0, 5),
  ];

  return (
    <>
      <MobileMenu menu={menuData} />
      <ul className="hidden gap-0.5 text-sm md:flex items-center">
        {menuData.map((item: { id: string; name: string; slug: string }) => (
          <li key={item?.id + item?.name} className="relative">
            <Link
              className="font-medium text-neutral-300 hover:text-white px-3 lg:px-4 py-2 rounded-full transition-colors duration-200 hover:bg-white/10 inline-flex items-center gap-1"
              href={item.slug ? `/${item.slug}` : "/search"}
              prefetch={true}
              aria-label={`Browse ${item.name} products`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
