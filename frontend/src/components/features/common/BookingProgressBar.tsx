import React from 'react';
import { Calendar, ClipboardList, FileText, Users, CheckCircle, CreditCard } from 'lucide-react';

interface BookingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const BookingProgressBar: React.FC<BookingProgressBarProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { name: '1. Start Date', icon: Calendar },
    { name: '2. Plan Week', icon: ClipboardList },
    { name: '3. Summary', icon: FileText },
    { name: '4. Details', icon: Users },
    { name: '5. Review', icon: CheckCircle },
    { name: '6. Confirmed', icon: CreditCard },
  ];

  return (
    <div className="mb-8">
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] h-3 rounded-full transition-all duration-500 ease-in-out shadow-lg"
          style={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs mt-4 text-gray-600">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className={`flex flex-col items-center transition-all duration-200 ${currentStep === index + 1 ? 'font-bold text-[#0080FF] scale-110' : 'text-gray-500'}`}>
              <Icon size={20} className="mb-1" />
              <span className="hidden sm:inline">{step.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingProgressBar;


