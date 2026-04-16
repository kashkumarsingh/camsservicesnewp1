/**
 * HTML Renderer Utility
 * 
 * Clean Architecture Layer: Infrastructure (Utility)
 * Purpose: Safely renders HTML content from CMS rich editor with sanitization
 * 
 * Plain English: This utility safely renders HTML content that comes from the CMS.
 * It sanitizes the HTML to prevent XSS attacks while preserving formatting.
 */

import DOMPurify from 'isomorphic-dompurify';
import { ReactNode } from 'react';

/**
 * Sanitize HTML content (works on both server and client)
 * 
 * @param html - Raw HTML string from CMS
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (!html || html.trim() === '') {
    return '';
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip HTML tags and return plain text
 * Useful for previews or when HTML is not needed
 * 
 * @param html - Raw HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Render HTML content safely
 * 
 * @param html - Raw HTML string from CMS
 * @param className - Optional CSS classes
 * @returns React element with sanitized HTML
 */
export function renderHtml(html: string, className?: string): ReactNode {
  if (!html || html.trim() === '') {
    return null;
  }
  
  // HTML content - sanitize and render
  const sanitized = sanitizeHtml(html);
  
  if (!sanitized || sanitized.trim() === '') {
    return null;
  }
  
  // If content is just a single paragraph with no other HTML structure,
  // we can render it more cleanly, but for rich content from CMS, render as-is
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

