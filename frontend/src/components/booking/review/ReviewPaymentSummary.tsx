import React from 'react';
import ReviewPackageInfo from './ReviewPackageInfo';
import { Package, CreditCard } from 'lucide-react';

interface ReviewPaymentSummaryProps {
  packageName: string;
  totalHours: number;
  usedHours: number;
  trainerName: string;
  sessionsCount: number;
  packagePrice?: number;
}

const ReviewPaymentSummary: React.FC<ReviewPaymentSummaryProps> = ({
  packageName,
  totalHours,
  usedHours,
  trainerName,
  sessionsCount,
  packagePrice,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-900">Package Details</h4>
        </div>
        <ReviewPackageInfo
          packageName={packageName}
          totalHours={totalHours}
          usedHours={usedHours}
          trainerName={trainerName}
          sessionsCount={sessionsCount}
        />
      </div>

      {typeof packagePrice === 'number' && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Payment Summary</h4>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">Package Price</div>
              <div className="text-3xl font-bold text-primary-blue">£{packagePrice.toFixed(2)}</div>
            </div>
            <div className="pt-3 border-t border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                <span className="text-xl font-bold text-green-700">£{packagePrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ReviewPaymentSummary;

