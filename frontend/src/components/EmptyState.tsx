import React from 'react';
import { Grid, Edit, MoreHorizontal } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col p-8 relative overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-stone-900 bg-white hover:bg-stone-50 rounded-lg border border-stone-200">
          <Grid size={16} />
          H & P
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-stone-900 bg-white hover:bg-stone-50 rounded-lg border border-stone-200">
          <Edit size={16} />
          Goldilocks
        </button>
        <button className="p-1.5 text-stone-600 hover:bg-stone-100 rounded">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="max-w-2xl">
        <div className="space-y-8 text-stone-900">
          <div>
            <h3 className="text-lg font-semibold mb-2">History:</h3>
            <p className="text-base">- Reports feeling unwell</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Past Medical History:</h3>
            <p className="text-base">- Medical History: Pneumonia diagnosis</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Physical Examination:</h3>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Investigations:</h3>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Impression:</h3>
            <p className="text-base">- Pneumonia</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Management Plan:</h3>
          </div>
        </div>
      </div>
    </div>
  );
}