import ProductCard from "@components/catalog/product/ProductCard";
import { ProductsSectionProps } from "@components/catalog/type";
import { baseUrl, getImageUrl, NOT_IMAGE } from "@utils/constants";


const Theme = ({ title, description, products }: ProductsSectionProps) => {
  return (
    <section className="py-10 md:py-14 lg:py-16 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8">
        <div className="mb-6 md:mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-archivo text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-lg">
              {description}
            </p>
          </div>
        </div>

        <ul className="m-0 grid grid-cols-2 gap-3 md:gap-4 lg:gap-5 p-0 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
         {products.map((item, index) => {
                 const imageUrl = getImageUrl(item?.baseImageUrl, baseUrl, NOT_IMAGE);
                  const ProductPrice =
                    item?.type === "configurable" || item?.type === "grouped" || item?.type === "bundle"
                      ? item?.minimumPrice ?? "0"
                      : item?.price ?? "0";

            return (
              <ProductCard
                key={item.id ?? index}
                currency="USD"
                imageUrl={imageUrl || ""}
                price={String(ProductPrice)}
                product={{
                  urlKey: item.urlKey || item.sku,
                  name: item?.name || item.sku,
                  id: item.id,
                  type: item.type,
                  isSaleable : item.isSaleable
                }} specialPrice={""}            />
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Theme;
