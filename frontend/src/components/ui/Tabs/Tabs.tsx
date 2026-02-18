"use client";
import React, { useState } from 'react';

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <div className="py-4">{children}</div>;
};

interface TabsProps {
  children: React.ReactElement<TabProps>[];
  initialActiveTab?: number;
}

const Tabs: React.FC<TabsProps> = ({ children, initialActiveTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {children.map((child, index) => (
            child && child.props && child.props.label ? (
              <button
                key={child.props.label}
                onClick={() => setActiveTab(index)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === index
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {child.props.label}
              </button>
            ) : null
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {children[activeTab].props.children}
      </div>
    </div>
  );
};

export default Tabs;