'use client';

import React from 'react';
import { renderHtml } from '@/utils/htmlRenderer';
import ReactMarkdown from 'react-markdown';

function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

/**
 * Common block for CMS rich-text (HTML or Markdown).
 * Reusable on any public page that has a main content field.
 */
export interface RichTextBlockProps {
  content: string;
  className?: string;
  proseClassName?: string;
}

export default function RichTextBlock({
  content,
  className = '',
  proseClassName = 'prose prose-lg md:prose-xl max-w-4xl mx-auto text-[#1E3A5F]',
}: RichTextBlockProps) {
  if (!content?.trim()) return null;

  return (
    <div className={className}>
      <article className={proseClassName}>
        {isHtmlContent(content)
          ? renderHtml(content, 'prose prose-lg md:prose-xl max-w-none')
          : <ReactMarkdown>{content}</ReactMarkdown>}
      </article>
    </div>
  );
}
