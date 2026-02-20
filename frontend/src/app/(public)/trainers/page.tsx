import type { Metadata } from 'next';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/utils/routes';
import { TRAINERS_PAGE } from '@/app/(public)/constants/trainersPageConstants';
import TrainersPageClient from './TrainersPageClient';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export const metadata: Metadata = buildPublicMetadata(
  {
    title: TRAINERS_PAGE.META_TITLE,
    description: TRAINERS_PAGE.META_DESCRIPTION,
    path: ROUTES.TRAINERS,
    imageAlt: TRAINERS_PAGE.HERO_TITLE,
  },
  BASE_URL
);

export default function TrainersPage() {
  return <TrainersPageClient />;
}
