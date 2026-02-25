import React from 'react';

type TLDRCardProps = {
  title?: string;
  children: React.ReactNode;
};

export default function TLDRCard({ title = 'TL;DR', children }: TLDRCardProps) {
  return (
    <div className="rounded-card border-2 border-primary-blue/30 bg-white shadow-card px-5 py-4 md:px-6 md:py-5 mb-8">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-blue to-light-blue-cyan text-white font-bold">i</div>
        <div className="flex-1">
          <div className="text-navy-blue font-heading font-bold text-lg mb-2">{title}</div>
          <div className="text-navy-blue text-sm md:text-base leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}







