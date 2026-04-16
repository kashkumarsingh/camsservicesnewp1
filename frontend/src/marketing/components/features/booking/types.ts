import { Package as OriginalPackage } from '@/data/packagesData';

export interface OriginalTrainer {
  id: number;
  slug: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  role: string;
  rating: number;
  certifications: string[];
  fullDescription: string;
  specialties: string[];
  capabilities?: string[];
  serviceRegions?: string[];
}

export interface BlogPost {
  title: string;
  slug: string;
  author: string;
  date: string;
  image: string;
  category?: string;
  excerpt: string;
  content: string;
}

export type Package = OriginalPackage;
