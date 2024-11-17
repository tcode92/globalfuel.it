import { ReactNode } from "react";

const SkeletonLoader = ({
  className = "",
}: {
  className?: string;
  children?: ReactNode | null;
}) => {
  return <div className={"skeleton-loader w-full " + className}></div>;
};
