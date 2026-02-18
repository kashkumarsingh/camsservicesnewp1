'use client';

import { useState, useEffect } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  className?: string;
  showLabel?: boolean;
}

export default function ShareButtons({ title, className = '', showLabel = true }: ShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const shareTitle = encodeURIComponent(title);

  if (!shareUrl) {
    return null; // Don't render until we have the URL
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
          <Share2 size={18} className="text-[#0080FF]" />
          Share:
        </span>
      )}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-[#0080FF]/10 hover:bg-[#0080FF] text-[#0080FF] hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Share on Facebook"
      >
        <Facebook size={20} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-[#0080FF]/10 hover:bg-[#0080FF] text-[#0080FF] hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Share on Twitter"
      >
        <Twitter size={20} />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-[#0080FF]/10 hover:bg-[#0080FF] text-[#0080FF] hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={20} />
      </a>
      <a
        href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}
        className="w-10 h-10 bg-[#0080FF]/10 hover:bg-[#0080FF] text-[#0080FF] hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Share via Email"
      >
        <Mail size={20} />
      </a>
    </div>
  );
}


