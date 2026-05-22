
import { FC } from "react";

interface CloseIconProps {
  className?: string;
  fill?: string;
  strokeWidth?: number;
}

const CloseIcon: FC<CloseIconProps> = ({ className = "w-5 h-5", fill = "none", strokeWidth = 2 }) => {
  return (
    <svg className={className} fill={fill} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};

export default CloseIcon;
