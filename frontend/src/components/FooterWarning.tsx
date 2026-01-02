import React from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
export function FooterWarning() {
  return <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-orange-600">
        <AlertCircle size={16} />
        <span>
          Review your note before use to ensure it accurately represents the
          visit
        </span>
      </div>
     
    </div>;
}