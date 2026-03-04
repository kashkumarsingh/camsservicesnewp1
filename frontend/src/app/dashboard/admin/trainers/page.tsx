import type { Metadata } from "next";
import React from "react";
import { AdminTrainersPageClient } from "./AdminTrainersPageClient";

export const metadata: Metadata = {
  title: "Admin Dashboard - Trainers",
  description: "Admin view for managing trainers.",
};

interface AdminTrainersPageProps {
  searchParams: Promise<{ trainer?: string; create?: string }>;
}

export default async function AdminTrainersPage({ searchParams }: AdminTrainersPageProps) {
  const { trainer: trainerId, create: createParam } = await searchParams;
  return (
    <AdminTrainersPageClient
      initialTrainerId={trainerId ?? undefined}
      initialShowCreateForm={createParam === '1'}
    />
  );
}

