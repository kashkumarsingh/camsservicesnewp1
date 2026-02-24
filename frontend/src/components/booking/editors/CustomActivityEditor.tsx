'use client';

import React from 'react';
import { Sparkles, X, Edit2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button/Button';

// Custom activity interface
export interface CustomActivity {
  id: string;
  name: string;
  duration: number;
  description?: string;
  equipment?: string;
}

interface CustomActivityEditorProps {
  showCustomForm: boolean;
  onShowCustomFormChange: (show: boolean) => void;
  // FIXED: Custom activities array + functions
  customActivities: CustomActivity[];
  customName: string;
  onCustomNameChange: (name: string) => void;
  customDuration: string;
  onCustomDurationChange: (duration: string) => void;
  customDescription: string;
  onCustomDescriptionChange: (description: string) => void;
  customEquipment: string;
  onCustomEquipmentChange: (equipment: string) => void;
  equipmentOption: 'none' | 'yes' | 'unsure';
  onEquipmentOptionChange: (option: 'none' | 'yes' | 'unsure') => void;
  editingCustomActivityId: string | null;
  onAddCustomActivity: () => void;
  onEditCustomActivity: (id: string) => void;
  onDeleteCustomActivity: (id: string) => void;
  remainingHours: number;
  duration: number;
  totalSelectedDuration?: number; // Duration of already selected activities
  onToggleActivity: () => void;
  onTrainerChoiceChange: (choice: boolean) => void;
}

const CustomActivityEditor: React.FC<CustomActivityEditorProps> = ({
  showCustomForm,
  onShowCustomFormChange,
  // FIXED: Custom activities array + functions
  customActivities,
  customName,
  onCustomNameChange,
  customDuration,
  onCustomDurationChange,
  customDescription,
  onCustomDescriptionChange,
  customEquipment,
  onCustomEquipmentChange,
  equipmentOption,
  onEquipmentOptionChange,
  editingCustomActivityId,
  onAddCustomActivity,
  onEditCustomActivity,
  onDeleteCustomActivity,
  remainingHours,
  duration,
  totalSelectedDuration = 0,
  onToggleActivity,
  onTrainerChoiceChange,
}) => {
  // Show list of custom activities when form is closed
  if (!showCustomForm) {
    return (
      <>
        {/* FIXED: Show list of added custom activities */}
        {customActivities.length > 0 && (
          <div className="mt-4 space-y-2">
            <h5 className="text-sm font-bold text-navy-blue flex items-center gap-2">
              <Sparkles size={16} className="text-[#9333EA]" />
              Your Requested Activities ({customActivities.length})
            </h5>
            {customActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-[#9333EA] rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h6 className="font-bold text-navy-blue flex items-center gap-2">
                      ✨ {activity.name}
                      <span className="text-xs font-semibold text-[#9333EA] bg-purple-100 px-2 py-0.5 rounded-full">
                        {activity.duration}h
                      </span>
                    </h6>
                    {activity.description && (
                      <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                    )}
                    {activity.equipment && (
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Equipment:</strong> {activity.equipment}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => onEditCustomActivity(activity.id)}
                      className="p-1.5 rounded-full hover:bg-purple-100 transition-colors text-[#9333EA]"
                      aria-label={`Edit ${activity.name}`}
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteCustomActivity(activity.id)}
                      className="p-1.5 rounded-full hover:bg-red-100 transition-colors text-red-600"
                      aria-label={`Delete ${activity.name}`}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  // Show modal form when showCustomForm is true
  return (
    <>
      {/* MODAL OVERLAY - Full screen with backdrop */}
      <div className="fixed inset-0 z-overlay overflow-y-auto" aria-labelledby="custom-activity-modal" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay - click to close */}
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity"
            onClick={() => onShowCustomFormChange(false)}
            aria-hidden="true"
          ></div>

          {/* Center the modal */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          {/* MODAL CONTENT - Higher z-index to appear above backdrop */}
          <div className="relative z-10 inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles size={24} className="animate-pulse" />
                  {editingCustomActivityId ? 'Edit Your Activity Request' : 'Tell Us What Your Child Wants to Do'}
                </h3>
                <button
                  onClick={() => onShowCustomFormChange(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                  aria-label="Close modal"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Activity Name */}
                <div>
                  <label className="block text-sm font-semibold text-navy-blue mb-2">
                    What activity would your child like? *
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => onCustomNameChange(e.target.value)}
                    placeholder="e.g., Baking cookies, Building robots, Painting..."
                    className="w-full px-4 py-3 rounded-card border-2 border-gray-200 focus:border-[#9333EA] focus:outline-none text-navy-blue"
                  />
                </div>

                {/* Duration Picker */}
                <div>
                  <label className="block text-sm font-semibold text-navy-blue mb-1">
                    How long should this activity last? *
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    💡 Most activities: 30min-1h (quick) or 1-2h (standard). <strong>Max: 3 hours per activity</strong>
                  </p>
                  
                  {/* PHASE 3: Enhanced duration picker with Hours + Minutes */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Hours Dropdown */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">Hours</label>
                      <select
                        value={(() => {
                          const parsed = parseFloat(customDuration || '0');
                          return Math.floor(parsed).toString();
                        })()}
                        onChange={(e) => {
                          const hours = parseInt(e.target.value, 10);
                          const currentMinutes = (parseFloat(customDuration || '0') % 1) * 60;
                          const totalHours = hours + (currentMinutes / 60);
                          onCustomDurationChange(totalHours.toString());
                        }}
                        className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#9333EA] focus:outline-none text-navy-blue text-sm"
                      >
                        {(() => {
                          const maxFromRemaining = remainingHours;
                          const maxFromSession = Math.max(0, duration - totalSelectedDuration);
                          const maxCustom = Math.min(maxFromRemaining, maxFromSession);
                          
                          // CRITICAL: Hard cap at 3 hours per activity (no activity should be more than 3 hours!)
                          const MAXIMUM_SINGLE_ACTIVITY_HOURS = 3;
                          const maxHours = Math.min(Math.floor(maxCustom), MAXIMUM_SINGLE_ACTIVITY_HOURS);
                          
                          const options: React.ReactElement[] = [];
                          for (let h = 0; h <= maxHours; h++) {
                            options.push(
                              <option key={h} value={h.toString()}>
                                {h} {h === 1 ? 'hour' : 'hours'}
                              </option>
                            );
                          }
                          
                          return options.length > 0 ? options : <option value="0">0 hours</option>;
                        })()}
                      </select>
                    </div>

                    {/* Minutes Dropdown */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">Minutes</label>
                      <select
                        value={(() => {
                          const parsed = parseFloat(customDuration || '0');
                          const minutes = Math.round((parsed % 1) * 60);
                          return minutes.toString();
                        })()}
                        onChange={(e) => {
                          const minutes = parseInt(e.target.value, 10);
                          const currentHours = Math.floor(parseFloat(customDuration || '0'));
                          const totalHours = currentHours + (minutes / 60);
                          onCustomDurationChange(totalHours.toString());
                        }}
                        className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#9333EA] focus:outline-none text-navy-blue text-sm"
                      >
                        <option value="0">0 min</option>
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                      </select>
                    </div>
                  </div>

                  {/* Total Duration Display */}
                  <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#9333EA]">Total Duration:</span>
                      <span className="text-sm font-bold text-navy-blue">
                        {(() => {
                          const parsed = parseFloat(customDuration || '0');
                          const hours = Math.floor(parsed);
                          const minutes = Math.round((parsed % 1) * 60);
                          
                          if (hours === 0 && minutes === 0) return '0 hours';
                          if (hours === 0) return `${minutes} minutes`;
                          if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
                          return `${hours}h ${minutes}m`;
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Helper Text - COMPACT */}
                  <p className="mt-2 text-xs text-green-700 font-semibold">
                    ✅ {remainingHours}h remaining in package
                    {totalSelectedDuration > 0 && (
                      <span className="text-gray-600 font-normal"> • {totalSelectedDuration.toFixed(1)}h/{duration}h selected this session</span>
                    )}
                  </p>

                  {/* Validation Warning */}
                  {(() => {
                    const maxFromRemaining = remainingHours;
                    const maxFromSession = Math.max(0, duration - totalSelectedDuration);
                    const maxCustom = Math.min(maxFromRemaining, maxFromSession);
                    
                    if (maxCustom < 0.5) {
                      return (
                        <p className="mt-2 text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg p-2">
                          ⚠️ No time available - session is full or package exhausted
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-navy-blue mb-2">
                    Tell us more (Optional)
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => onCustomDescriptionChange(e.target.value)}
                    placeholder="e.g., Making chocolate chip cookies and decorating with icing"
                    rows={2}
                    className="w-full px-4 py-3 rounded-card border-2 border-gray-200 focus:border-[#9333EA] focus:outline-none resize-none text-navy-blue"
                  />
                </div>

                {/* Equipment Options */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-navy-blue mb-2">
                    Does your child need special equipment or materials?
                  </label>
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center cursor-pointer p-3 rounded-card border-2 border-gray-200 hover:border-[#9333EA] transition-colors bg-white">
                      <input
                        type="radio"
                        name="equipmentOption"
                        value="none"
                        checked={equipmentOption === 'none'}
                        onChange={() => {
                          onEquipmentOptionChange('none');
                          onCustomEquipmentChange('');
                        }}
                        className="w-4 h-4 text-[#9333EA] border-gray-300 focus:ring-2 focus:ring-[#9333EA] mr-3"
                      />
                      <span className="text-navy-blue">No, standard equipment is fine</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-3 rounded-card border-2 border-gray-200 hover:border-[#9333EA] transition-colors bg-white">
                      <input
                        type="radio"
                        name="equipmentOption"
                        value="yes"
                        checked={equipmentOption === 'yes'}
                        onChange={() => onEquipmentOptionChange('yes')}
                        className="w-4 h-4 text-[#9333EA] border-gray-300 focus:ring-2 focus:ring-[#9333EA] mr-3"
                      />
                      <span className="text-navy-blue">Yes, I&apos;ll specify below</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-3 rounded-card border-2 border-gray-200 hover:border-[#9333EA] transition-colors bg-white">
                      <input
                        type="radio"
                        name="equipmentOption"
                        value="unsure"
                        checked={equipmentOption === 'unsure'}
                        onChange={() => {
                          onEquipmentOptionChange('unsure');
                          onCustomEquipmentChange('Not sure, please advise');
                        }}
                        className="w-4 h-4 text-[#9333EA] border-gray-300 focus:ring-2 focus:ring-[#9333EA] mr-3"
                      />
                      <span className="text-navy-blue">Not sure, please advise</span>
                    </label>
                  </div>
                  {equipmentOption === 'yes' && (
                    <input
                      type="text"
                      value={customEquipment}
                      onChange={(e) => onCustomEquipmentChange(e.target.value)}
                      placeholder="e.g., Magnifying glass, Water bottle"
                      className="w-full px-4 py-3 rounded-card border-2 border-[#9333EA] focus:border-[#9333EA] focus:outline-none text-navy-blue"
                    />
                  )}
                  {equipmentOption === 'unsure' && (
                    <div className="px-4 py-3 rounded-card border-2 border-gray-200 bg-gray-50 text-sm text-gray-600">
                      Your trainer will contact you to discuss equipment needs.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer - Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-purple-200">
                <button
                  onClick={() => onShowCustomFormChange(false)}
                  className="flex-1 px-6 py-3 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors text-gray-700 font-semibold bg-white hover:bg-gray-50 shadow-sm"
                >
                  Cancel
                </button>
                <Button
                  onClick={() => {
                    const parsedDuration = parseFloat(customDuration || '0');
                    if (customName.trim() && parsedDuration > 0) {
                      onAddCustomActivity();
                    }
                  }}
                  disabled={(() => {
                    const parsedDuration = parseFloat(customDuration || '0');
                    return !customName.trim() || parsedDuration <= 0;
                  })()}
                  className="flex-1 shadow-lg"
                >
                  {editingCustomActivityId ? '✏️ Update Request' : '✅ Add to Session'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomActivityEditor;
