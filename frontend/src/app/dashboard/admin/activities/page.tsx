import { Metadata } from "next";
import { AdminActivitiesPageClient } from "./AdminActivitiesPageClient";

export const metadata: Metadata = {
  title: "Activities | Admin Dashboard",
  description: "Manage standard activities used in parent and trainer booking flows.",
};

export default function AdminActivitiesPage() {
  return <AdminActivitiesPageClient />;
}

