import React from 'react';
import Link from 'next/link';

type JumpToNavProps = {
  items: Array<{ id: string; label: string }>;
};

export default function JumpToNav({ items }: JumpToNavProps) {
  if (!items?.length) return null;
  return (
    <nav className="mb-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200 p-4 md:p-5">
      <div className="text-[#1E3A5F] font-semibold mb-2">Jump to</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            className="text-sm md:text-base rounded-full border border-[#0080FF]/30 bg-white px-3 py-1.5 hover:bg-[#0080FF] hover:text-white transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}







