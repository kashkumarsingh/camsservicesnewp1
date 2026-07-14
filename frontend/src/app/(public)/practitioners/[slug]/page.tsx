import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PractitionerProfilePageClient } from '@/marketing/components/practitioners/PractitionerProfilePageClient';
import { PractitionerSeoIntro } from '@/marketing/components/practitioners/PractitionerSeoIntro';
import { getPractitionerProfileBySlug, getPractitionerProfileSlugs } from '@/marketing/content/practitioners';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

export const revalidate = 1800;

const BASE_URL = getMetadataBaseUrl();

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): { slug: string }[] {
  return getPractitionerProfileSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getPractitionerProfileBySlug(slug);

  if (!profile) {
    return {};
  }

  return buildPublicMetadata(
    {
      title: profile.metaTitle,
      description: profile.metaDescription,
      path: ROUTES.PRACTITIONER_BY_SLUG(profile.slug),
      imageAlt: `${profile.name}, ${profile.role} at ${profile.company}`,
    },
    BASE_URL
  );
}

export default async function PractitionerProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = getPractitionerProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <PractitionerProfilePageClient profile={profile} />
      <div className="sr-only">
        <PractitionerSeoIntro profile={profile} />
      </div>
    </>
  );
}
