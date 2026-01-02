import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Trash2, AlertTriangle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { supabase, Task } from '../lib/supabase';

interface TaskDetailsProps {
  task: Task;
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

export default function TaskDetails({ task, onBack, onDelete }: TaskDetailsProps) {
  const [notes, setNotes] = useState(task.notes || '');
  const [warnings, setWarnings] = useState<string[]>(task.warnings || []);
  const [newWarning, setNewWarning] = useState('');
  const [isAddingWarning, setIsAddingWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completed, setCompleted] = useState(task.completed);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  useEffect(() => {
    setNotes(task.notes || '');
    setWarnings(task.warnings || []);
    setCompleted(task.completed);
    setEditedTitle(task.title);
  }, [task]);

  const updateTask = async (updates: Partial<Task>) => {
    setIsSaving(true);
    const { error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating task:', error);
    }
    setIsSaving(false);
  };

  const handleNotesBlur = () => {
    if (notes !== task.notes) {
      updateTask({ notes });
    }
  };

  const addWarning = async () => {
    if (!newWarning.trim()) return;
    const updatedWarnings = [...warnings, newWarning.trim()];
    setWarnings(updatedWarnings);
    await updateTask({ warnings: updatedWarnings });
    setNewWarning('');
    setIsAddingWarning(false);
  };

  const removeWarning = async (index: number) => {
    const updatedWarnings = warnings.filter((_, i) => i !== index);
    setWarnings(updatedWarnings);
    await updateTask({ warnings: updatedWarnings });
  };

  const handleGenerateDocument = async () => {
    await updateTask({ document_generated: true });
    alert('Document generation feature coming soon!');
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const toggleComplete = async () => {
    const newCompletedState = !completed;
    setCompleted(newCompletedState);
    await supabase
      .from('tasks')
      .update({
        completed: newCompletedState,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);
  };

  const handleTitleBlur = async () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      await updateTask({ title: editedTitle.trim() });
    } else if (!editedTitle.trim()) {
      setEditedTitle(task.title);
    }
    setIsEditingTitle(false);
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
        <h2 className="text-base font-semibold text-stone-900">Task Details</h2>
        {isSaving && (
          <span className="text-xs text-stone-500 ml-auto">Saving...</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <div className="flex items-start gap-2">
            <button
              onClick={toggleComplete}
              className="mt-0.5 flex-shrink-0"
            >
              {completed ? (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-stone-300 hover:border-stone-400 transition-colors" />
              )}
            </button>
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleBlur();
                  } else if (e.key === 'Escape') {
                    setEditedTitle(task.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="flex-1 text-base font-medium text-stone-900 outline-none border border-stone-300 rounded px-2 py-1 focus:border-stone-400"
                autoFocus
              />
            ) : (
              <h3
                onClick={() => setIsEditingTitle(true)}
                className={`text-base font-medium flex-1 cursor-pointer hover:bg-stone-50 rounded px-2 py-1 -ml-2 ${
                  completed ? 'line-through text-stone-500' : 'text-stone-900'
                }`}
              >
                {task.title}
              </h3>
            )}
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-semibold text-amber-900">Warnings</h4>
            </div>
            <div className="space-y-1.5">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white rounded px-2.5 py-1.5 border border-amber-200"
                >
                  <span className="text-sm text-amber-900">{warning}</span>
                  <button
                    onClick={() => removeWarning(index)}
                    className="text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAddingWarning && (
          <div className="bg-white rounded-lg border border-stone-200 p-3">
            <input
              type="text"
              value={newWarning}
              onChange={(e) => setNewWarning(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addWarning();
                } else if (e.key === 'Escape') {
                  setIsAddingWarning(false);
                  setNewWarning('');
                }
              }}
              placeholder="Enter warning (e.g., Medication allergy)"
              className="w-full text-sm text-stone-800 placeholder-stone-400 outline-none mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={addWarning}
                className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
              >
                Add Warning
              </button>
              <button
                onClick={() => {
                  setIsAddingWarning(false);
                  setNewWarning('');
                }}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <label className="block text-xs font-semibold text-stone-900 mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add detailed notes about this task..."
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
          <button
            onClick={handleGenerateDocument}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Generate Document
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete Task
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-900 mb-2">
                Are you sure you want to delete this task? This action cannot be undone.
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
