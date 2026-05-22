import { FC, Suspense } from "react";
import { safeParse } from "@utils/helper";
import { ThemeCustomizationResponse } from "@/types/theme/theme-customization";
import ImageCarousel from "./ImageCarousel";
import ProductCarousel from "./ProductCarousel";
import CategoryCarousel from "./CategoryCarousel";
import { CategoryCarouselSkeleton } from "@components/common/skeleton/CategoryCarouselSkeleton";

interface RenderThemeCustomizationProps {
    themeCustomizations: ThemeCustomizationResponse['themeCustomizations'];
}

const RenderThemeCustomization: FC<RenderThemeCustomizationProps> = ({ themeCustomizations }) => {
    if (!themeCustomizations?.edges?.length) return null;

    let productCarouselIndex = 0;

    const sortedEdges = [...themeCustomizations.edges].sort((a, b) =>
        (a.node.sortOrder || 0) - (b.node.sortOrder || 0)
    );

    return (
        <>
            <div className="w-full bg-white dark:bg-neutral-950 -mt-15 md:-mt-17">
                {sortedEdges.map(({ node }) => {
                    const translation = node.translations.edges.find(e => e.node.locale === 'en') || node.translations.edges[0];
                    if (!translation || node.type !== "image_carousel") return null;
                    const options = safeParse(translation.node.options) || {};
                    return <ImageCarousel key={node.id} options={options as any} />;
                })}

                {sortedEdges.map(({ node }) => {
                    const translation = node.translations.edges.find(e => e.node.locale === 'en') || node.translations.edges[0];
                    if (!translation || node.type !== "category_carousel") return null;
                    const options = safeParse(translation.node.options) || {};
                    return (
                        <Suspense key={node.id} fallback={<CategoryCarouselSkeleton />}>
                            <CategoryCarousel options={options as any} />
                        </Suspense>
                    );
                })}

                <div className="flex flex-col">
                    {sortedEdges.map(({ node }) => {
                        const translation = node.translations.edges.find(e => e.node.locale === 'en') || node.translations.edges[0];
                        if (!translation) return null;

                        const options = safeParse(translation.node.options) || {};
                        if (Object.keys(options).length === 0) {
                            console.error("Error parsing options for", node.type);
                        }

                        switch (node.type) {
                            case "product_carousel": {
                                productCarouselIndex++;
                                const opts = options as any;
                                const limit = opts?.filters?.limit ? parseInt(opts.filters.limit, 10) : null;
                                const itemCount = limit || (productCarouselIndex === 1 ? 3 : 4);
                                return <ProductCarousel key={node.id} options={{ ...options, title: node.name } as any} itemCount={itemCount} sortOrder={node?.sortOrder} />;
                            }
                            default:
                                return null;
                        }
                    })}
                </div>
            </div>
        </>
    );
};

export default RenderThemeCustomization;
