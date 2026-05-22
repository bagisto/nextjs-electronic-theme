
import { FC } from "react";

interface CheckIconProps {
  className?: string;
  fill?: string;
  strokeWidth?: number;
}

const CheckIcon: FC<CheckIconProps> = ({ className = "w-5 h-5", fill = "none", strokeWidth = 2 }) => {
  return (
    <svg className={className} fill={fill} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M5 13l4 4L19 7" />
    </svg>
  );
};

export default CheckIcon;
