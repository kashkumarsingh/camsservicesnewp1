import { Metadata } from 'next';
import ChildChecklistPageClient from './ChildChecklistPageClient';

export const metadata: Metadata = {
  title: 'Child Checklist - CAMS Services',
  description: 'Complete checklist for your child',
};

export const dynamic = 'force-dynamic';

export default function ChildChecklistPage() {
  return <ChildChecklistPageClient />;
}

