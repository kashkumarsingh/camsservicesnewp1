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
          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-blue text-white text-xs flex-shrink-0">
            {item.icon ?? '✓'}
          </span>
          <span className="text-navy-blue text-sm md:text-base leading-relaxed">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}







