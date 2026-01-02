import { useState } from 'react';
import { Plus, AlertTriangle, X, ChevronDown, ExternalLink } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  warnings?: Warning[];
}

interface Warning {
  type: 'allergy' | 'conflict';
  message: string;
}

const DEMO_MEDS: Medication[] = [
  { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
  { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
  { id: '3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime' },
];

const PATIENT_ALLERGIES = ['Penicillin', 'Sulfa drugs'];

const DRUG_CONFLICTS: Record<string, string[]> = {
  'Warfarin': ['Aspirin', 'Ibuprofen', 'Atorvastatin'],
  'Aspirin': ['Warfarin', 'Ibuprofen'],
  'Metformin': ['Alcohol'],
  'Lisinopril': ['Potassium supplements'],
};

export default function Medications() {
  const [medications, setMedications] = useState<Medication[]>(DEMO_MEDS);
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [generatePrescription, setGeneratePrescription] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editMed, setEditMed] = useState({ name: '', dosage: '', frequency: '' });
  const [editGeneratePrescription, setEditGeneratePrescription] = useState(false);

  const hasAnyWarnings = medications.some(med => {
    if (med.warnings && med.warnings.length > 0) return true;
    const conflicts = DRUG_CONFLICTS[med.name] || [];
    const currentMedNames = medications.map(m => m.name);
    const hasConflicts = conflicts.some(conflictDrug => currentMedNames.includes(conflictDrug));
    const hasAllergy = PATIENT_ALLERGIES.some(allergy =>
      med.name.toLowerCase().includes(allergy.toLowerCase()) ||
      allergy.toLowerCase().includes(med.name.toLowerCase())
    );
    return hasConflicts || hasAllergy;
  });

  const checkWarnings = (medName: string): Warning[] => {
    const foundWarnings: Warning[] = [];

    if (PATIENT_ALLERGIES.some(allergy =>
      medName.toLowerCase().includes(allergy.toLowerCase()) ||
      allergy.toLowerCase().includes(medName.toLowerCase())
    )) {
      foundWarnings.push({
        type: 'allergy',
        message: `Patient has a known allergy to this medication class`
      });
    }

    const conflicts = DRUG_CONFLICTS[medName] || [];
    const currentMedNames = medications.map(m => m.name);

    conflicts.forEach(conflictDrug => {
      if (currentMedNames.some(current => current === conflictDrug)) {
        foundWarnings.push({
          type: 'conflict',
          message: `Potential interaction with ${conflictDrug}`
        });
      }
    });

    for (const [existingMed, conflictList] of Object.entries(DRUG_CONFLICTS)) {
      if (currentMedNames.includes(existingMed) && conflictList.includes(medName)) {
        foundWarnings.push({
          type: 'conflict',
          message: `Potential interaction with ${existingMed}`
        });
      }
    }

    return foundWarnings;
  };

  const addMedication = () => {
    if (!newMed.name.trim()) return;

    const medWarnings = checkWarnings(newMed.name);

    if (medWarnings.length > 0) {
      setWarnings(medWarnings);
      return;
    }

    const medication: Medication = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage || 'As prescribed',
      frequency: newMed.frequency || 'As directed',
      warnings: []
    };

    setMedications([...medications, medication]);
    setNewMed({ name: '', dosage: '', frequency: '' });
    setIsAddingMed(false);
    setWarnings([]);
    setGeneratePrescription(false);
  };

  const addMedicationAnyway = () => {
    const medication: Medication = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage || 'As prescribed',
      frequency: newMed.frequency || 'As directed',
      warnings: warnings
    };

    setMedications([...medications, medication]);
    setNewMed({ name: '', dosage: '', frequency: '' });
    setIsAddingMed(false);
    setWarnings([]);
    setGeneratePrescription(false);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const startEditing = (med: Medication) => {
    setEditingMedId(med.id);
    setEditMed({ name: med.name, dosage: med.dosage, frequency: med.frequency });
  };

  const cancelEditing = () => {
    setEditingMedId(null);
    setEditMed({ name: '', dosage: '', frequency: '' });
    setEditGeneratePrescription(false);
  };

  const saveMedication = (id: string) => {
    if (!editMed.name.trim()) return;

    setMedications(medications.map(m =>
      m.id === id
        ? {
            ...m,
            name: editMed.name,
            dosage: editMed.dosage || 'As prescribed',
            frequency: editMed.frequency || 'As directed'
          }
        : m
    ));
    cancelEditing();
  };

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <ChevronDown
              className={`w-5 h-5 text-stone-600 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            />
            <h2 className="text-md font-semibold text-stone-900">Current Medications</h2>
            {medications.length > 0 && (
              <span className="text-sm text-stone-600 font-medium">({medications.length})</span>
            )}
            {hasAnyWarnings && (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </button>
          {isExpanded && !isAddingMed && (
            <button
              onClick={() => setIsAddingMed(true)}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add medication</span>
            </button>
          )}
        </div>

        {isExpanded && <div className="space-y-2 mb-3">
          {medications.map((med) => (
            <div key={med.id}>
              {editingMedId === med.id ? (
                <div className="bg-stone-50 rounded-lg border border-stone-200 p-2.5 space-y-2">
                  <input
                    type="text"
                    value={editMed.name}
                    onChange={(e) => setEditMed({ ...editMed, name: e.target.value })}
                    placeholder="Medication name"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded outline-none focus:border-stone-400"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editMed.dosage}
                    onChange={(e) => setEditMed({ ...editMed, dosage: e.target.value })}
                    placeholder="Dosage (e.g., 10mg)"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded outline-none focus:border-stone-400"
                  />
                  <input
                    type="text"
                    value={editMed.frequency}
                    onChange={(e) => setEditMed({ ...editMed, frequency: e.target.value })}
                    placeholder="Frequency (e.g., Once daily)"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded outline-none focus:border-stone-400"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editGeneratePrescription}
                        onChange={(e) => setEditGeneratePrescription(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
                      />
                      <span className="text-sm text-stone-700">Generate prescription</span>
                    </label>
                    <a
                      href="https://idmp.ucsf.edu/adult-antimicrobial-dosing-non-dialysis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>Dosage reference</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveMedication(med.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-stone-50 rounded-lg border border-stone-200 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => startEditing(med)}
                      >
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {med.name} <span className="text-stone-600 font-normal">{med.dosage}</span>
                          {med.warnings && med.warnings.length > 0 && (
                            <AlertTriangle className="inline-block w-3 h-3 text-amber-600 ml-1.5" />
                          )}
                        </p>
                        <p className="text-xs text-stone-500">{med.frequency}</p>
                      </div>
                      <button
                        onClick={() => removeMedication(med.id)}
                        className="p-1 hover:bg-stone-200 rounded transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5 text-stone-500" />
                      </button>
                    </div>
                  </div>
                  {med.warnings && med.warnings.length > 0 && (
                    <div className="mt-1 ml-2.5 space-y-0.5">
                      {med.warnings.map((warning, idx) => (
                        <p key={idx} className="text-xs text-amber-700">
                          {warning.message}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>}

        {isExpanded && (isAddingMed ? (
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3 space-y-2">
            <input
              type="text"
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
              placeholder="Medication name"
              className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded outline-none focus:border-stone-400"
              autoFocus
            />
            <input
              type="text"
              value={newMed.dosage}
              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
              placeholder="Dosage (e.g., 10mg)"
              className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded outline-none focus:border-stone-400"
            />
            <input
              type="text"
              value={newMed.frequency}
              onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
              placeholder="Frequency (e.g., Once daily)"
              className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded outline-none focus:border-stone-400"
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generatePrescription}
                  onChange={(e) => setGeneratePrescription(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
                />
                <span className="text-sm text-stone-700">Generate prescription</span>
              </label>
              <a
                href="https://idmp.ucsf.edu/adult-antimicrobial-dosing-non-dialysis"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>Dosage reference</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900">
                        {warning.type === 'allergy' ? 'Allergy Warning' : 'Drug Interaction'}
                      </p>
                      <p className="text-xs text-amber-700">{warning.message}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={addMedicationAnyway}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
                  >
                    Add anyway
                  </button>
                  <button
                    onClick={() => {
                      setWarnings([]);
                      setNewMed({ name: '', dosage: '', frequency: '' });
                      setIsAddingMed(false);
                      setGeneratePrescription(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {warnings.length === 0 && (
              <div className="flex gap-2">
                <button
                  onClick={addMedication}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded transition-colors"
                >
                  Add medication
                </button>
                <button
                  onClick={() => {
                    setIsAddingMed(false);
                    setNewMed({ name: '', dosage: '', frequency: '' });
                    setWarnings([]);
                    setGeneratePrescription(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : null)}
      </div>
    </div>
  );
}
