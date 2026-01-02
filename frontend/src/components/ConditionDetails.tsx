import { useState, useEffect } from 'react';
import { ArrowLeft, Link as LinkIcon, ExternalLink, Trash2 } from 'lucide-react';
import { supabase, Condition } from '../lib/supabase';

interface ConditionDetailsProps {
  condition: Condition;
  onBack: () => void;
  onDelete: () => void;
}

const referenceLinks = [
  {
    title: 'NHSN Pneumonia Checklist (CDC)',
    url: 'https://www.cdc.gov/nhsn/pdfs/checklists/2025-NHSN-Pneumonia-PNEU-Checklist-FINAL.pdf'
  },
  {
    title: 'Pneumonia Treatment and Recovery',
    url: 'https://www.lung.org/lung-health-diseases/lung-disease-lookup/pneumonia/treatment-and-recovery'
  },
  {
    title: 'Pneumonia Symptoms and Diagnosis',
    url: 'https://www.lung.org/lung-health-diseases/lung-disease-lookup/pneumonia/symptoms-and-diagnosis'
  }
];

export default function ConditionDetails({ condition, onBack, onDelete }: ConditionDetailsProps) {
  const [notes, setNotes] = useState(condition.notes || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(condition.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(condition.notes || '');
    setEditedName(condition.name);
  }, [condition]);

  const updateCondition = async (updates: Partial<Condition>) => {
    setIsSaving(true);
    const { error } = await supabase
      .from('conditions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', condition.id);

    if (error) {
      console.error('Error updating condition:', error);
    }
    setIsSaving(false);
  };

  const handleNotesBlur = () => {
    if (notes !== condition.notes) {
      updateCondition({ notes });
    }
  };

  const handleNameBlur = async () => {
    if (editedName.trim() && editedName !== condition.name) {
      await updateCondition({ name: editedName.trim() });
    } else if (!editedName.trim()) {
      setEditedName(condition.name);
    }
    setIsEditingName(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="flex items-center gap-2 p-3 border-b border-stone-200">
        <button
          onClick={onBack}
          className="p-1 hover:bg-stone-200 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <h2 className="text-base font-semibold text-stone-900">Condition Details</h2>
        {isSaving && (
          <span className="text-xs text-stone-500 ml-auto">Saving...</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="bg-white rounded-lg border border-stone-200 p-3">
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNameBlur();
                } else if (e.key === 'Escape') {
                  setEditedName(condition.name);
                  setIsEditingName(false);
                }
              }}
              className="w-full text-base font-medium text-stone-900 outline-none border border-stone-300 rounded px-2 py-1 focus:border-stone-400"
              autoFocus
            />
          ) : (
            <h3
              onClick={() => setIsEditingName(true)}
              className="text-base font-medium text-stone-900 cursor-pointer hover:bg-stone-50 rounded px-2 py-1 -ml-2"
            >
              {condition.name}
            </h3>
          )}
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <label className="block text-xs font-semibold text-stone-900 mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add detailed notes..."
            className="w-full text-sm text-stone-800 placeholder-stone-400 outline-none resize-none border border-stone-200 rounded p-2 focus:border-stone-400 transition-colors"
            rows={4}
          />
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <label className="block text-xs font-semibold text-stone-900 mb-2">
            <LinkIcon className="w-3.5 h-3.5 inline mr-1" />
            Reference Links
          </label>
          <div className="space-y-1.5">
            {referenceLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors group"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="group-hover:underline">{link.title}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {!showDeleteConfirm ? (
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete Condition
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-900 mb-2">
                Are you sure you want to delete this condition? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
