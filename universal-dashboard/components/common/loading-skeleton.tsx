import type { HTMLAttributes } from "react";
import React from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({
  lines = 3,
  className = "",
  ...rest
}) => {
  return (
    <div className={`space-y-2 ${className}`} {...rest}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="h-3 w-full animate-pulse rounded bg-slate-200"
        />
      ))}
    </div>
  );
};

