import clsx from "clsx";
import { RatingTypes } from "./type";
import StarIcon from "./icons/StarIcon";

export const Rating = ({
  length = 5,
  star = 0,
  size = "size-4",
  className,
  reviewCount,
  onReviewClick,
}: RatingTypes) => {
  const rating = star ?? 0;
  const reviewCountToShow = reviewCount ?? star > 0;

  return (
   <div className={clsx("flex items-center gap-x-2", className)}>
  {reviewCountToShow ? (
    <>
  <div className="flex gap-x-0.5">
    {Array.from({ length }).map((_, index) => (
      <StarIcon
        key={index}
        className={clsx(
          size,
          index < rating
            ? "fill-yellow-400 dark:fill-yellow-400"
            : "fill-neutral-300 dark:fill-neutral-700",
          "stroke-yellow-400 dark:stroke-yellow-400"
        )}
      />
    ))}
  </div>
    <span className="text-sm text-neutral-600 dark:text-neutral-400">
      ({reviewCountToShow} {reviewCountToShow === 1 ? 'Review' : 'Reviews'})
    </span>
    </>
  ) : (
    <span
    className="text-sm text-neutral-900 dark:text-white underline cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors duration-200"
    onClick={onReviewClick}
    >
      Write a review
    </span>
  )}
</div>
  );
};
