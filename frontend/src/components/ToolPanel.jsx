import { useState } from 'react';
import { mockTools } from '../utils/mockData';

export default function ToolPanel({ activeTool, onToolChange }) {
  return (
    <div className="bg-gray-100 border-r border-gray-300 p-4 w-24 flex flex-col items-center space-y-3">
      {mockTools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`w-20 h-14 flex items-center justify-center rounded-lg transition ${
            activeTool === tool.id
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
          title={tool.name}
        >
          <span className="text-sm font-medium">{tool.name}</span>
        </button>
      ))}
    </div>
  );
}

