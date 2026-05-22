import clsx from "clsx";

interface ChevronLeftIconProps extends React.ComponentProps<"svg"> {
  className?: string;
}

export default function ChevronLeftIcon({ className, ...props }: ChevronLeftIconProps) {
  return (
    <svg
      className={clsx("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
