import React from 'react';
import Image from 'next/image';

interface CardProps {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, description, imageSrc, imageAlt, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition ${className}`}>
      {imageSrc && (
        <div className="mb-4">
          <Image src={imageSrc} alt={imageAlt || ''} width={128} height={128} className="w-32 h-32 rounded-full mx-auto object-cover" />
        </div>
      )}
      {title && <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>}
      {description && <p className="text-gray-600 text-sm">{description}</p>}
      {children}
    </div>
  );
};

export default Card;