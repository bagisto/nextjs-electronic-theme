import { UserIcon } from "@components/common/icons/UserIcon";
import clsx from "clsx";

export default function OpenAuth({ className }: { className?: string }) {
  return (
    <>
      <div className="relative flex items-center justify-center rounded-md lg:h-11 lg:w-11 text-white">
        <UserIcon className={clsx("h-5 w-5  ", className)} />
      </div>
    </>

  );
}

