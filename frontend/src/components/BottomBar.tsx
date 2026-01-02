import React from 'react';
import { Sparkles, Mic, ArrowUp } from 'lucide-react';
export function BottomBar() {
  return <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <input type="text" placeholder="Ask Heidi to do anything..." className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm" />
        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
          <Mic size={18} />
        </button>
        <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center">
          <ArrowUp size={18} className="text-gray-600" />
        </button>
      </div>
    </div>;
}