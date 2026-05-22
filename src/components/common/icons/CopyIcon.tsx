
import { FC } from "react";

interface CopyIconProps {
  className?: string;
  fill?: string;
  strokeWidth?: number;
}

const CopyIcon: FC<CopyIconProps> = ({ className = "w-5 h-5", fill = "none", strokeWidth = 2 }) => {
  return (
    <svg className={className} fill={fill} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
};

export default CopyIcon;
