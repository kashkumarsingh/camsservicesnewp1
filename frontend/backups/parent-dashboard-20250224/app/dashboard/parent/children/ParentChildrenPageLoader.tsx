"use client";

import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

const ParentChildrenPageClient = dynamic(
  () => import("./ParentChildrenPageClient"),
  {
    loading: () => <DashboardSkeleton variant="parent-children" />,
    ssr: false,
  }
);

export default function ParentChildrenPageLoader() {
  return <ParentChildrenPageClient />;
}
