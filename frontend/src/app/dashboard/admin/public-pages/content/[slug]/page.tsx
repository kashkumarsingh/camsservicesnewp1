import type { Metadata } from 'next';
import React from 'react';
import { notFound } from 'next/navigation';
import { PublicPageContentEditClient } from './PublicPageContentEditClient';
import {
  PUBLIC_PAGES_CONTENT_SLUGS,
  POLICY_DOCUMENT_SLUGS,
} from '@/dashboard/utils/publicPageConstants';

export const metadata: Metadata = {
  title: 'Admin - Public Page Content',
  description: 'Edit content for a public page (text only).',
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicPageContentEditPage({ params }: Props) {
  const { slug } = await params;
  const isContentPage = (PUBLIC_PAGES_CONTENT_SLUGS as readonly string[]).includes(slug);
  const isPolicyDocument = (POLICY_DOCUMENT_SLUGS as readonly string[]).includes(slug);
  if (!isContentPage && !isPolicyDocument) {
    notFound();
  }
  return <PublicPageContentEditClient slug={slug} />;
}
