import type { Metadata } from 'next';
import { RiskAssessmentPageClient } from '@/marketing/components/risk-assessment/RiskAssessmentPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Risk Assessment - CAMS Services',
      description: 'Understand whether CAMS support is suitable for your young person and current context.',
      path: ROUTES.RISK_ASSESSMENT,
      imageAlt: 'Risk assessment at CAMS Services',
    },
    BASE_URL
  );
}

export default function RiskAssessmentPage() {
  return <RiskAssessmentPageClient />;
}
