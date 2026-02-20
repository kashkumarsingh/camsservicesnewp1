import React from 'react';
import { CheckCircle2, Sparkles, Gift } from 'lucide-react';

interface PackageDetailsDisplayProps {
  pkg: {
    description: string;
    features: string[];
    perks: string[];
  };
}

const PackageDetailsDisplay: React.FC<PackageDetailsDisplayProps> = ({ pkg }) => {
  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border-2 border-gray-200">
        <h3 className="text-2xl font-bold text-navy-blue mb-4 flex items-center gap-2">
          <Sparkles className="text-primary-blue" size={28} />
          Package Overview
        </h3>
        <p className="text-gray-700 leading-relaxed text-lg">{pkg.description}</p>
      </div>

      {/* Key Features */}
      <div>
        <h3 className="text-2xl font-bold text-navy-blue mb-6 flex items-center gap-2">
          <CheckCircle2 className="text-primary-blue" size={28} />
          Key Features & Benefits
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {pkg.features.map((feature, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-4 bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 card-hover-lift hover:rotate-3 group"
            >
              <CheckCircle2 className="text-primary-blue flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" size={20} />
              <span className="text-gray-700 font-medium group-hover:text-primary-blue transition-colors duration-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Perks */}
      <div>
        <h3 className="text-2xl font-bold text-navy-blue mb-6 flex items-center gap-2">
          <Gift className="text-primary-blue" size={28} />
          Additional Perks & Bonuses
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {pkg.perks.map((perk, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-300 shadow-md hover:shadow-2xl transition-all duration-300 card-hover-lift hover:rotate-3 group"
            >
              <Gift className="text-[#FFD700] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" size={20} />
              <span className="text-navy-blue font-semibold group-hover:text-primary-blue transition-colors duration-300">{perk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageDetailsDisplay;
