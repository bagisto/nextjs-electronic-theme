import clsx from "clsx";

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: {
    mobile?: string;
    laptop?: string;
  };
  bold?: boolean;
}

interface SubheadingProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    mobile?: string;
    laptop?: string;
  };
}

const defaultHeadingSizes = {
  mobile: "text-xl",
  laptop: "text-2xl",
};

const defaultSubheadingSizes = {
  mobile: "text-base",
  laptop: "text-lg",
};

export function Heading({
  children,
  className,
  as: Component = "h2",
  size = defaultHeadingSizes,
}: HeadingProps) {
  const mobileSize = size.mobile || defaultHeadingSizes.mobile;
  const laptopSize = size.laptop || defaultHeadingSizes.laptop;

  return (
    <Component
      className={clsx(
        mobileSize,
        laptopSize,
        "text-neutral-900 font-semibold dark:text-white",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Subheading({
  children,
  className,
  size = defaultSubheadingSizes,
}: SubheadingProps) {
  const mobileSize = size.mobile || defaultSubheadingSizes.mobile;
  const laptopSize = size.laptop || defaultSubheadingSizes.laptop;

  return (
    <p
      className={clsx(
        mobileSize,
        laptopSize,
        "text-neutral-600 dark:text-neutral-400",
        className
      )}
    >
      {children}
    </p>
  );
}
