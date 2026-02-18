import React from 'react';

type IconListItem = {
  text: React.ReactNode;
  icon?: React.ReactNode;
};

type IconListProps = {
  items: IconListItem[];
};

export default function IconList({ items }: IconListProps) {
  return (
    <ul className="grid md:grid-cols-2 gap-3">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0080FF] text-white text-xs flex-shrink-0">
            {item.icon ?? '✓'}
          </span>
          <span className="text-[#1E3A5F] text-sm md:text-base leading-relaxed">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}







