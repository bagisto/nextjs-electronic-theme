
import StarIcon from "@/components/common/icons/StarIcon";
import clsx from "clsx";
import { FC } from "react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: string;
  enablePartial?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  fillClass?: string;
  emptyClass?: string;
}

export const StarRating: FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = "w-4 h-4",
  enablePartial = false,
  interactive = false,
  onChange,
  className,
  fillClass = "fill-yellow-400 text-yellow-400",
  emptyClass = "fill-neutral-200 text-neutral-200"
}) => {
  return (
    <div className={clsx("flex items-center gap-0.5", className)}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;

        if (enablePartial) {
          const fillLevel = Math.min(Math.max(rating - index, 0), 1);
          return (
            <div key={index} className={clsx("relative", size)}>
              <StarIcon className={clsx(size, "absolute top-0 left-0", emptyClass)} />
              {fillLevel > 0 && (
                <div
                  className="absolute top-0 left-0 h-full overflow-hidden"
                  style={{ width: `${fillLevel * 100}%` }}
                >
                  <StarIcon className={clsx(size, fillClass)} />
                </div>
              )}
            </div>
          );
        }

        const isFilled = starValue <= Math.round(rating);

        return (
          <div
            key={index}
            className={clsx(interactive && "cursor-pointer")}
            onClick={() => interactive && onChange?.(starValue)}
            role={interactive ? "button" : undefined}
          >
            <StarIcon
              className={clsx(
                size,
                isFilled ? fillClass : emptyClass,
                interactive && "transition-colors"
              )}
            />
          </div>
        );
      })}
    </div>
  );
};
