
import { FC, ReactNode } from "react";

interface InfoItemProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export const InfoItem: FC<InfoItemProps> = ({ icon, title, subtitle }) => {
  return (
    <div className="flex items-start bg-gray-200 dark:bg-gray-700 p-2 rounded-xl gap-3">
      {icon}
      <div>
        <p className="font-medium text-sm text-neutral-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
