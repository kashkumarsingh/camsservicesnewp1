import type { Metadata } from "next";
import ParentChildrenPageLoader from "./ParentChildrenPageLoader";

export const metadata: Metadata = {
  title: "Parent Dashboard - Children",
  description: "Manage children linked to your account.",
};

export default function ParentChildrenPage() {
  return <ParentChildrenPageLoader />;
}

