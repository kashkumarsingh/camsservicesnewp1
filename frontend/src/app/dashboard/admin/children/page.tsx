import { Metadata } from "next";
import { AdminChildrenPageClient } from "./AdminChildrenPageClient";

export const metadata: Metadata = {
  title: "Children Management | Admin Dashboard",
  description: "Manage children accounts and approvals",
};

export default function AdminChildrenPage() {
  return <AdminChildrenPageClient />;
}
