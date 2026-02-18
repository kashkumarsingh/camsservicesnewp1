import React from 'react';

type TLDRCardProps = {
  title?: string;
  children: React.ReactNode;
};

export default function TLDRCard({ title = 'TL;DR', children }: TLDRCardProps) {
  return (
    <div className="rounded-2xl border-2 border-[#0080FF]/30 bg-white shadow-md px-5 py-4 md:px-6 md:py-5 mb-8">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0080FF] to-[#00D4FF] text-white font-bold">i</div>
        <div className="flex-1">
          <div className="text-[#1E3A5F] font-heading font-bold text-lg mb-2">{title}</div>
          <div className="text-[#1E3A5F] text-sm md:text-base leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}







