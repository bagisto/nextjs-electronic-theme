
import { FC } from "react";

interface LightningIconProps {
  className?: string;
  fill?: string;
  strokeWidth?: number;
}

const LightningIcon: FC<LightningIconProps> = ({ className = "w-5 h-5", fill = "none", strokeWidth = 2 }) => {
  return (
    <svg className={className} fill={fill} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
};

export default LightningIcon;
