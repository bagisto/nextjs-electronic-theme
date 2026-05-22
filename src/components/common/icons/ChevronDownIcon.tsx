
import { FC } from "react";

interface ChevronDownIconProps {
  className?: string;
  fill?: string;
  strokeWidth?: number;
}

const ChevronDownIcon: FC<ChevronDownIconProps> = ({ className = "w-5 h-5", fill = "none", strokeWidth = 2 }) => {
  return (
    <svg className={className} fill={fill} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M19 9l-7 7-7-7" />
    </svg>
  );
};

export default ChevronDownIcon;
