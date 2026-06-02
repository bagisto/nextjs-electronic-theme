import { FC } from "react";
import Link from "next/link";
import clsx from "clsx";
import { GridTileImage } from "@/components/theme/ui/grid/Tile";

interface ThreeItemGridProps {
    title: string;
    description: string;
    products: Array<{
        id: string;
        name: string;
        urlKey: string;
        baseImageUrl: string;
        price: string | number;
        minimumPrice?: string | number;
        type: string;
    }>;
}

interface ProductItem {
    id: string;
    name: string;
    urlKey: string;
    baseImageUrl: string;
    price: string | number;
    minimumPrice?: string | number;
    type: string;
}

function ThreeItemGridItem({ product, size, priority }: {
    product: ProductItem;
    size: 'full' | 'half';
    priority?: boolean;
}) {
    return (
        <div
            className={
                size === 'full'
                    ? 'md:col-span-4 md:row-span-2'
                    : 'md:col-span-2 md:row-span-1'
            }
        >
            <Link
                className="relative block h-full w-full"
                href={`/product/${product.urlKey}`}
                aria-label={`${product?.name}`}
                style={{
                    aspectRatio: size === 'full' ? '1018 / 800' : '502 / 393'
                }}
            >
                <GridTileImage
                    src={product.baseImageUrl}
                    className="object-cover "
                    fill
                    sizes={
                        size === 'full'
                            ? '(min-width: 768px) 66vw, 100vw'
                            : '(min-width: 768px) 33vw, 100vw'
                    }
                    priority={priority}
                    alt={product.name}
                    label={{
                        position: size === 'full' ? 'center' : 'bottom',
                        title: product.name,
                        amount: String(product.type === 'configurable' || product.type === 'grouped' || product.type === 'bundle' ? (product.minimumPrice || '0') : (product.price || '0')),
                        currencyCode: 'USD',
                    }}
                />
            </Link>
        </div>
    );
}


function MobileThreeItemGridItem({ product, size, priority }: {
    product: ProductItem;
    size: 'full' | 'half';
    priority?: boolean;
}) {

    return (
        <div
            className={
                size === 'full' ? 'col-span-1 xxs:col-span-2 order-2' : 'col-span-1'
            }
        >
            <Link
                className={clsx(
                    "relative block h-full w-full aspect-[380/280]",
                    size === "half" && "xxs:aspect-[182/280]"
                )}
                href={`/product/${product.urlKey}`}
                aria-label={`${product?.name}`}
            >
                <GridTileImage
                    src={product.baseImageUrl}
                    className="object-cover "
                    fill
                    priority={priority}
                    alt={product.name}
                    label={{
                        position: size === 'full' ? 'center' : 'bottom',
                        title: product.name,
                        amount: String(product.type === 'configurable' || product.type === 'grouped' || product.type === 'bundle' ? (product.minimumPrice || '0') : (product.price || '0')),
                        currencyCode: 'USD',
                    }}
                />
            </Link>
        </div>
    );
}

export const ThreeItemGrid: FC<ThreeItemGridProps> = ({ title, description, products }) => {
    if (!products || products.length < 3) return null;

    const [firstProduct, secondProduct, thirdProduct] = products;

    return (
        <section className="py-12 md:py-16 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8">
            <div className="md:max-w-4.5xl mx-auto mb-10 w-auto px-0 text-center md:px-36">
                <h1 className="mb-4 font-outfit text-xl md:text-4xl font-semibold text-black dark:text-white">
                    {title}
                </h1>
                <p className="text-sm md:text-base font-normal text-black/60 dark:text-neutral-300">
                    {description}
                </p>
            </div>

            <div className="hidden md:grid gap-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
                <ThreeItemGridItem product={firstProduct} size="full" priority={true} />
                <ThreeItemGridItem product={secondProduct} size="half" priority={true} />
                <ThreeItemGridItem product={thirdProduct} size="half" />
            </div>

            <div className="grid md:hidden gap-4 grid-cols-1 xxs:grid-cols-2 lg:max-h-[calc(100vh-200px)]">
                <MobileThreeItemGridItem product={firstProduct} size="full" priority={true} />
                <MobileThreeItemGridItem product={secondProduct} size="half" priority={true} />
                <MobileThreeItemGridItem product={thirdProduct} size="half" />
            </div>

        </div>
        </section>
    );
};

export default ThreeItemGrid;
