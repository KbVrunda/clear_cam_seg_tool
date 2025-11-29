import { useState } from 'react';
import { mockLabels } from '../utils/mockData';

const colorMap = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  gray: 'bg-gray-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
};

export default function LabelSidebar({ opacity, onOpacityChange }) {
  const [labels, setLabels] = useState(mockLabels);

  const toggleLabel = (labelKey) => {
    setLabels((prev) => ({
      ...prev,
      [labelKey]: { ...prev[labelKey], checked: !prev[labelKey].checked },
    }));
  };

  const toggleSublabel = (sublabelName) => {
    setLabels((prev) => {
      const updatedSublabels = prev.dirty.sublabels.map((sublabel) =>
        sublabel.name === sublabelName
          ? { ...sublabel, checked: !sublabel.checked }
          : sublabel
      );
      
      // If any sublabel is checked, ensure dirty is also checked
      const hasCheckedSublabel = updatedSublabels.some((s) => s.checked);
      
      return {
        ...prev,
        dirty: {
          ...prev.dirty,
          // If any sublabel is checked, dirty must be checked
          checked: hasCheckedSublabel ? true : prev.dirty.checked,
          sublabels: updatedSublabels,
        },
      };
    });
  };

  const toggleExpand = () => {
    setLabels((prev) => ({
      ...prev,
      dirty: { ...prev.dirty, expanded: !prev.dirty.expanded },
    }));
  };

  return (
    <div className="bg-white border-l border-gray-300 w-80 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Labels</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overlay Opacity: {opacity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        {/* Clean Label */}
        <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={labels.clean.checked}
              onChange={() => toggleLabel('clean')}
              className="w-4 h-4"
            />
            <div className={`w-4 h-4 rounded ${colorMap[labels.clean.color]}`} />
            <span className="text-sm font-medium">{labels.clean.name}</span>
          </div>
        </div>

        {/* Dirty Label with Sublabels */}
        <div>
          <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="checkbox"
                checked={labels.dirty.checked}
                onChange={() => toggleLabel('dirty')}
                className="w-4 h-4"
              />
              <div className={`w-4 h-4 rounded ${colorMap[labels.dirty.color]}`} />
              <span className="text-sm font-medium">{labels.dirty.name}</span>
            </div>
            <button
              onClick={toggleExpand}
              className="text-gray-500 hover:text-gray-700"
            >
              {labels.dirty.expanded ? '▼' : '▶'}
            </button>
          </div>
          
          {labels.dirty.expanded && (
            <div className="ml-6 mt-2 space-y-2">
              {labels.dirty.sublabels.map((sublabel) => (
                <div
                  key={sublabel.name}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sublabel.checked || false}
                      onChange={() => toggleSublabel(sublabel.name)}
                      className="w-4 h-4"
                    />
                    <div className={`w-4 h-4 rounded ${colorMap[sublabel.color]}`} />
                    <span className="text-sm">{sublabel.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{sublabel.count} images</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

