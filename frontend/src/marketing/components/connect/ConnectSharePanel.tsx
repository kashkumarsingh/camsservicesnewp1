'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { Copy, Mail, MessageCircle, Share2 } from 'lucide-react';
import {
  buildEmailShareHref,
  buildFacebookShareHref,
  buildLinkedInShareHref,
  buildSmsShareHref,
  buildWhatsAppShareHref,
  CONNECT_CANONICAL_SHARE_URL,
  CONNECT_SHARE_MESSAGE,
} from '@/marketing/content/connect-hub';
import { PAGE_SURFACES } from '@/marketing/components/shared/page-layout';

type ShareChannel = {
  id: string;
  label: string;
  href: string;
  icon: typeof MessageCircle;
  external?: boolean;
};

export function ConnectSharePanel(): ReactElement {
  const [pageUrl, setPageUrl] = useState<string>(CONNECT_CANONICAL_SHARE_URL);
  const [copied, setCopied] = useState<'link' | 'message' | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setPageUrl(window.location.href.split('#')[0] || CONNECT_CANONICAL_SHARE_URL);
    setCanNativeShare(typeof navigator.share === 'function');
  }, []);

  const shareText = useMemo(() => `${CONNECT_SHARE_MESSAGE}\n\n${pageUrl}`, [pageUrl]);

  const channels: readonly ShareChannel[] = useMemo(
    () => [
      { id: 'whatsapp', label: 'WhatsApp', href: buildWhatsAppShareHref(pageUrl), icon: MessageCircle, external: true },
      { id: 'sms', label: 'Text message', href: buildSmsShareHref(pageUrl), icon: MessageCircle },
      { id: 'email', label: 'Email', href: buildEmailShareHref(pageUrl), icon: Mail },
      { id: 'facebook', label: 'Share on Facebook', href: buildFacebookShareHref(pageUrl), icon: Share2, external: true },
      { id: 'linkedin', label: 'Share on LinkedIn', href: buildLinkedInShareHref(pageUrl), icon: Share2, external: true },
    ],
    [pageUrl]
  );

  async function copyValue(value: string, kind: 'link' | 'message'): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2500);
    } catch {
      setCopied(null);
    }
  }

  async function nativeShare(): Promise<void> {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'CAMS Services',
        text: CONNECT_SHARE_MESSAGE,
        url: pageUrl,
      });
    } catch {
      /* user cancelled */
    }
  }

  return (
    <section aria-labelledby="share-cams-heading" className={`${PAGE_SURFACES.cardBase} p-6 md:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">Ready-made sharing</p>
      <h2 id="share-cams-heading" className="mt-2 font-heading text-2xl font-bold text-cams-ink">
        Share CAMS Services
      </h2>
      <p className="mt-3 text-sm leading-6 text-cams-ink-secondary">
        Use these buttons to send CAMS through WhatsApp, text message or email. The message explains
        membership, staff registration, and the 20 September launch.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <a
              key={channel.id}
              href={channel.href}
              {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-cams-ink transition hover:border-cams-primary/40 hover:bg-cams-soft"
            >
              <Icon size={18} aria-hidden />
              {channel.label}
            </a>
          );
        })}
        {canNativeShare ? (
          <button
            type="button"
            onClick={() => void nativeShare()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-cams-ink transition hover:border-cams-primary/40 hover:bg-cams-soft"
          >
            <Share2 size={18} aria-hidden />
            Share from this device
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void copyValue(pageUrl, 'link')}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-cams-ink transition hover:border-cams-primary/40 hover:bg-cams-soft"
        >
          <Copy size={18} aria-hidden />
          {copied === 'link' ? 'Link copied' : 'Copy CAMS link'}
        </button>
        <button
          type="button"
          onClick={() => void copyValue(shareText, 'message')}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-cams-ink transition hover:border-cams-primary/40 hover:bg-cams-soft sm:col-span-2"
        >
          <Copy size={18} aria-hidden />
          {copied === 'message' ? 'Message copied' : 'Copy sharing message'}
        </button>
      </div>

      <blockquote className="mt-6 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-cams-ink-secondary">
        {shareText}
      </blockquote>
    </section>
  );
}
