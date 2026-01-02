import React, { useState } from 'react';
import { Calendar, Globe, Trash2, Mic, ChevronDown } from 'lucide-react';
export function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  return <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left side - Patient details */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">👤</span>
            <span className="text-gray-900 font-medium underline decoration-dotted underline-offset-4">
              Martin Freckles
            </span>
          </div>
          <button className="p-1.5 text-red-500 hover:bg-red-50 rounded">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Right side - Start transcribing button */}
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="bg-green-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-green-700">
            <Mic size={18} />
            Resume
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Second row - Session details */}
      <div className="px-6 py-3 flex items-center gap-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>Today 11:35AM</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Globe size={16} />
          <span>English</span>
        </div>
        
      </div>
    </div>;
}