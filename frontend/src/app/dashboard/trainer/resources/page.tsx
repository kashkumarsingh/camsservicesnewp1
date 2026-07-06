import type { Metadata } from 'next';
import React from 'react';
import { TrainerResourcesPageClient } from './TrainerResourcesPageClient';

export const metadata: Metadata = {
  title: 'Trainer Dashboard - Resources',
  description: 'Internal policies and procedures for CAMS trainers.',
};

export default function TrainerResourcesPage() {
  return <TrainerResourcesPageClient />;
}
