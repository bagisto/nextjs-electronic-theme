
import { FC } from "react";

interface WishlistIconProps {
  className?: string;
  fill?: string;
}

const WishlistIcon: FC<WishlistIconProps> = ({ className = "", fill = "none" }) => {
  return (
    <svg
      className={className}
      fill={fill}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
};

export default WishlistIcon;
