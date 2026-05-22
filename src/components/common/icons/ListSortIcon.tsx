
import { FC } from "react";

interface ListSortIconProps {
  className?: string;
  fill?: string;
  strokeWidth?: number;
}

const ListSortIcon: FC<ListSortIconProps> = ({ className = "w-4 h-4", fill = "none", strokeWidth = 2 }) => {
  return (
    <svg className={className} fill={fill} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  );
};

export default ListSortIcon;
