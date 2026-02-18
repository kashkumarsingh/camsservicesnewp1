import type { Metadata } from "next";
import React from "react";
import { AdminTrainersPageClient } from "./AdminTrainersPageClient";

export const metadata: Metadata = {
  title: "Admin Dashboard - Trainers",
  description: "Admin view for managing trainers.",
};

interface AdminTrainersPageProps {
  searchParams: Promise<{ trainer?: string }>;
}

export default async function AdminTrainersPage({ searchParams }: AdminTrainersPageProps) {
  const { trainer: trainerId } = await searchParams;
  return <AdminTrainersPageClient initialTrainerId={trainerId ?? undefined} />;
}

