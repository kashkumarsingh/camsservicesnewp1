import React from 'react';
import Link from 'next/link';
import { User, Mail, Phone, MapPin } from 'lucide-react';

interface ReviewParentInfoProps {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
}

const ReviewParentInfo: React.FC<ReviewParentInfoProps> = ({ name, email, phone, address, postcode }) => {
  const missingFields: string[] = [];
  if (!phone?.trim()) missingFields.push('phone');
  if (!address?.trim()) missingFields.push('address');
  if (!postcode?.trim()) missingFields.push('postcode');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <User className="w-4 h-4 text-gray-500" />
        <span className="font-semibold text-gray-700">Name:</span>
        <span className="text-gray-900">{name || '-'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Mail className="w-4 h-4 text-gray-500" />
        <span className="font-semibold text-gray-700">Email:</span>
        <span className="text-gray-900 break-all">{email || '-'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Phone className="w-4 h-4 text-gray-500" />
        <span className="font-semibold text-gray-700">Phone:</span>
        {phone ? (
          <span className="text-gray-900">{phone}</span>
        ) : (
          <Link href="/account" target="_blank" className="text-primary-blue hover:underline font-semibold text-xs">
            Add phone →
          </Link>
        )}
      </div>
      <div className="flex items-start gap-2 text-sm">
        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-gray-700 mb-1">Address:</div>
          {address ? (
            <div className="text-gray-900">{address}</div>
          ) : (
            <Link href="/account" target="_blank" className="text-primary-blue hover:underline font-semibold text-xs">
              Add address →
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="font-semibold text-gray-700">Postcode:</span>
        {postcode ? (
          <span className="text-gray-900 font-mono">{postcode}</span>
        ) : (
          <Link href="/account" target="_blank" className="text-primary-blue hover:underline font-semibold text-xs">
            Add postcode →
          </Link>
        )}
      </div>
      {missingFields.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-semibold text-amber-900 mb-2">Required for booking:</p>
          <ul className="space-y-1 text-xs text-amber-800">
            {missingFields.includes('phone') && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <Link href="/account" target="_blank" className="text-primary-blue hover:underline">
                  Add parent phone
                </Link>
              </li>
            )}
            {missingFields.includes('address') && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <Link href="/account" target="_blank" className="text-primary-blue hover:underline">
                  Add home address
                </Link>
              </li>
            )}
            {missingFields.includes('postcode') && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <Link href="/account" target="_blank" className="text-primary-blue hover:underline">
                  Add postcode
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReviewParentInfo;

