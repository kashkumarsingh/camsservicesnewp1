import { Metadata } from "next";
import { AdminPackagesPageClient } from "./AdminPackagesPageClient";

export const metadata: Metadata = {
  title: "Packages | Admin Dashboard",
  description: "Manage packages with full CRUD operations and filtering",
};

export default function AdminPackagesPage() {
  return <AdminPackagesPageClient />;
}
