import { SEO_BLOG_ARTICLES } from '@/marketing/content/blog';
import { resolveBlogCoverImage } from '@/marketing/content/blog/seo-blog-helpers';
import { LOCATION_AREAS } from '@/marketing/content/locations';
import {
  CAMS_PUBLIC_IMAGE_ID,
  camsPageImagePath,
  camsProgrammeImagePath,
  camsPublicImageJpgPath,
  type CamsProgrammeImageKey,
} from '@/marketing/mock/cams-public-images';
import { INTERVENTION_PACKAGE_IDS } from '@/marketing/mock/intervention-packages';
import {
  SERVICE_PROGRAMME_LIST,
  serviceSlugFromProgramme,
} from '@/marketing/mock/services-programmes';
import { ROUTES } from '@/shared/utils/routes';

export type ImageSeoRecord = {
  readonly path: string;
  readonly title: string;
  readonly caption: string;
  readonly alt: string;
};

const programmeAlt = (
  service: string,
  detail: string
): Pick<ImageSeoRecord, 'alt' | 'caption' | 'title'> => ({
  title: `${service} | CAMS services`,
  caption: `${service} from CAMS services Ltd across West London and the UK.`,
  alt: `${service}: ${detail}`,
});

/** SEO metadata for every programme cover in /public/images. */
export const PROGRAMME_IMAGE_SEO: Record<CamsProgrammeImageKey, ImageSeoRecord> = {
  outdoorEngagement: {
    path: camsProgrammeImagePath('outdoorEngagement'),
    ...programmeAlt(
      'Sports support programme',
      'young person taking part in outdoor sports mentoring with a CAMS practitioner'
    ),
  },
  boxingFitness: {
    path: camsProgrammeImagePath('boxingFitness'),
    ...programmeAlt(
      'Fitness mentoring and wellbeing support',
      'one-to-one fitness and wellbeing session for a young person'
    ),
  },
  community: {
    path: camsProgrammeImagePath('community'),
    ...programmeAlt(
      'Chaperone services and child transport',
      'DBS-checked practitioner supporting safe community access and supervised child transport'
    ),
  },
  goals: {
    path: camsProgrammeImagePath('goals'),
    ...programmeAlt(
      'Behaviour support and SEMH mentoring',
      'behavioural management and conflict resolution session with a young person'
    ),
  },
  mentoring: {
    path: camsProgrammeImagePath('mentoring'),
    ...programmeAlt(
      'Youth mentoring services',
      'one-to-one mentoring and coaching conversation between practitioner and young person'
    ),
  },
  routine: {
    path: camsProgrammeImagePath('routine'),
    ...programmeAlt(
      'Family support services',
      'family support and parent coaching session with CAMS services'
    ),
  },
  sen: {
    path: camsProgrammeImagePath('sen'),
    ...programmeAlt(
      'SEND support services',
      'SEN and education support activity tailored to additional learning needs'
    ),
  },
};

export const SITE_LOGO_IMAGE: ImageSeoRecord = {
  path: '/logos/cams-services-logo.webp',
  title: 'CAMS services logo',
  caption: 'CAMS services Ltd logo, chaperone and mentoring provider UK.',
  alt: 'CAMS services logo, chaperone services and child support UK',
};

export const OG_DEFAULT_IMAGE: ImageSeoRecord = {
  path: camsPublicImageJpgPath(CAMS_PUBLIC_IMAGE_ID.ogDefault),
  title: 'CAMS services programmes',
  caption: 'CAMS services delivers chaperone, transport, mentoring, SEND and family support UK-wide.',
  alt: 'CAMS services programmes for children: chaperone, transport, mentoring and SEND support',
};

export const CAREERS_HERO_IMAGE: ImageSeoRecord = {
  path: camsPageImagePath('careersHero'),
  title: 'Careers at CAMS services',
  caption: 'Join CAMS services as a DBS-checked mentor, chaperone or family support practitioner.',
  alt: 'Careers at CAMS services, mentoring and chaperone roles UK',
};

export const BECOME_A_TRAINER_IMAGE: ImageSeoRecord = {
  path: camsPageImagePath('becomeATrainerPromo'),
  title: 'Become a CAMS trainer',
  caption: 'Apply to deliver mentoring, chaperone and family support sessions with CAMS services.',
  alt: 'Become a CAMS services trainer, mentoring and chaperone practitioner',
};

export function programmeImageSeo(key: CamsProgrammeImageKey): ImageSeoRecord {
  return PROGRAMME_IMAGE_SEO[key];
}

export function absoluteImageUrl(baseUrl: string, imagePath: string): string {
  const base = baseUrl.replace(/\/$/, '');
  return imagePath.startsWith('http') ? imagePath : `${base}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}

type ResolvePrimaryImageOptions = {
  areaName?: string;
};

/**
 * Preferred real photo for a public path (used for og:image, schema, and on-page SEO images).
 * Returns null only for non-marketing routes (dashboard, thank-you, etc.).
 */
export function resolvePagePrimaryImage(
  path: string,
  options: ResolvePrimaryImageOptions = {}
): ImageSeoRecord | null {
  const normalized = path.replace(/\/$/, '') || '/';

  if (normalized === '/') {
    return PROGRAMME_IMAGE_SEO.community;
  }

  if (normalized === ROUTES.CHAPERONE_SERVICES) {
    return PROGRAMME_IMAGE_SEO.community;
  }

  if (normalized === ROUTES.SERVICES) {
    return PROGRAMME_IMAGE_SEO.community;
  }

  if (normalized === ROUTES.AREAS) {
    return PROGRAMME_IMAGE_SEO.community;
  }

  if (normalized === ROUTES.PACKAGES) {
    return PROGRAMME_IMAGE_SEO.mentoring;
  }

  if (normalized === ROUTES.BLOG) {
    return OG_DEFAULT_IMAGE;
  }

  if (normalized === ROUTES.ABOUT) {
    return PROGRAMME_IMAGE_SEO.mentoring;
  }

  if (normalized === ROUTES.SCHOOLS) {
    return PROGRAMME_IMAGE_SEO.sen;
  }

  if (normalized === ROUTES.CONTACT || normalized === ROUTES.REFERRAL) {
    return PROGRAMME_IMAGE_SEO.community;
  }

  if (normalized === ROUTES.CAREERS) {
    return CAREERS_HERO_IMAGE;
  }

  if (normalized === ROUTES.BECOME_A_TRAINER) {
    return BECOME_A_TRAINER_IMAGE;
  }

  if (normalized === ROUTES.FAQ || normalized.startsWith(`${ROUTES.FAQ}/`)) {
    return PROGRAMME_IMAGE_SEO.sen;
  }

  if (normalized === ROUTES.TRAINERS || normalized.startsWith(`${ROUTES.TRAINERS}/`)) {
    return PROGRAMME_IMAGE_SEO.mentoring;
  }

  if (normalized === ROUTES.RISK_ASSESSMENT) {
    return PROGRAMME_IMAGE_SEO.goals;
  }

  if (normalized === ROUTES.POLICIES || normalized.startsWith(`${ROUTES.POLICIES}/`)) {
    return OG_DEFAULT_IMAGE;
  }

  const serviceMatch = normalized.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const programme = SERVICE_PROGRAMME_LIST.find(
      (item) => serviceSlugFromProgramme(item) === serviceMatch[1]
    );
    if (programme) {
      return programmeImageSeo(programme.coverKey);
    }
  }

  const areaMatch = normalized.match(/^\/areas\/([^/]+)$/);
  if (areaMatch) {
    const areaName = options.areaName ?? areaMatch[1];
    const record = PROGRAMME_IMAGE_SEO.community;
    return {
      ...record,
      title: `Child support in ${areaName} | CAMS services`,
      caption: `Chaperone service, child transport, youth mentoring and SEND support in ${areaName}.`,
      alt: `Chaperone services, child transport and youth mentoring in ${areaName} with CAMS services`,
    };
  }

  const packageMatch = normalized.match(/^\/packages\/([^/]+)$/);
  if (packageMatch) {
    return {
      ...PROGRAMME_IMAGE_SEO.mentoring,
      title: `Intervention package ${packageMatch[1]} | CAMS services`,
      caption: 'Combined chaperone, transport, mentoring and family support intervention packages.',
      alt: 'CAMS intervention package combining mentoring, chaperone transport and family support',
    };
  }

  const blogMatch = normalized.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const post = SEO_BLOG_ARTICLES.find(
      (item) => item.slug.replace(/^blog\//, '') === blogMatch[1]
    );
    if (post) {
      const coverPath = resolveBlogCoverImage(post);
      return {
        path: coverPath,
        title: post.title,
        caption: post.excerpt,
        alt: post.coverImageAlt,
      };
    }
  }

  if (
    normalized.startsWith('/login') ||
    normalized.startsWith('/register') ||
    normalized.startsWith('/dashboard') ||
    normalized.startsWith('/book/') ||
    normalized.includes('/thank-you')
  ) {
    return null;
  }

  return OG_DEFAULT_IMAGE;
}

export type ImageSitemapPageEntry = {
  readonly pagePath: string;
  readonly images: readonly ImageSeoRecord[];
};

/** All indexable page + image pairs for sitemap-images.xml (whole public ecosystem). */
export function getImageSitemapEntries(): readonly ImageSitemapPageEntry[] {
  const staticPaths = [
    '/',
    ROUTES.ABOUT,
    ROUTES.SERVICES,
    ROUTES.CHAPERONE_SERVICES,
    ROUTES.AREAS,
    ROUTES.PACKAGES,
    ROUTES.CONTACT,
    ROUTES.REFERRAL,
    ROUTES.SCHOOLS,
    ROUTES.BLOG,
    ROUTES.CAREERS,
    ROUTES.BECOME_A_TRAINER,
    ROUTES.TRAINERS,
    ROUTES.FAQ,
    ROUTES.RISK_ASSESSMENT,
    ROUTES.POLICIES,
  ] as const;

  const entries: ImageSitemapPageEntry[] = staticPaths.map((pagePath) => {
    const primary = resolvePagePrimaryImage(pagePath);
    const images: ImageSeoRecord[] = primary ? [primary] : [];
    if (pagePath === '/' || pagePath === ROUTES.SERVICES) {
      images.push(...Object.values(PROGRAMME_IMAGE_SEO));
    }
    return { pagePath, images: dedupeImages(images) };
  });

  for (const programme of SERVICE_PROGRAMME_LIST) {
    const pagePath = ROUTES.SERVICE_BY_SLUG(serviceSlugFromProgramme(programme));
    const image = programmeImageSeo(programme.coverKey);
    entries.push({ pagePath, images: [image] });
  }

  for (const area of LOCATION_AREAS) {
    const pagePath = ROUTES.AREA_BY_SLUG(area.slug);
    const image = resolvePagePrimaryImage(pagePath, { areaName: area.name });
    if (image) {
      entries.push({ pagePath, images: [image] });
    }
  }

  for (const packageId of INTERVENTION_PACKAGE_IDS) {
    const pagePath = `/packages/${packageId}`;
    const image = resolvePagePrimaryImage(pagePath);
    if (image) {
      entries.push({ pagePath, images: [image] });
    }
  }

  for (const post of SEO_BLOG_ARTICLES) {
    const slug = post.slug.replace(/^blog\//, '');
    const pagePath = `/blog/${slug}`;
    const image = resolvePagePrimaryImage(pagePath);
    if (image) {
      entries.push({ pagePath, images: [image] });
    }
  }

  return entries;
}

function dedupeImages(images: readonly ImageSeoRecord[]): ImageSeoRecord[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.path)) return false;
    seen.add(image.path);
    return true;
  });
}
