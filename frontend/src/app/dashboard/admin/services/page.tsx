import { Metadata } from "next";
import { AdminServicesPageClient } from "./AdminServicesPageClient";

export const metadata: Metadata = {
  title: "Services | Admin Dashboard",
  description: "Manage services with full CRUD operations and filtering",
};

export default function AdminServicesPage() {
  return <AdminServicesPageClient />;
}
