import { useState, useEffect } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { supabase, Diagnosis as DiagnosisType } from '../lib/supabase';
import { analyzePatient } from '../lib/api';

const COMMON_ICD_CODES = [
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'E78.5', description: 'Hyperlipidemia, unspecified' },
  { code: 'J44.9', description: 'Chronic obstructive pulmonary disease, unspecified' },
  { code: 'F41.9', description: 'Anxiety disorder, unspecified' },
  { code: 'M79.3', description: 'Panniculitis, unspecified' },
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' },
  { code: 'N18.9', description: 'Chronic kidney disease, unspecified' },
];

export default function Diagnosis() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisType[]>([]);
  const [isAddingDiagnosis, setIsAddingDiagnosis] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [codeSearchTerm, setCodeSearchTerm] = useState('');
  const [editingDiagnosisId, setEditingDiagnosisId] = useState<string | null>(null);
  const [editDiagnosisText, setEditDiagnosisText] = useState('');
  const [editCodes, setEditCodes] = useState<string[]>([]);
  const [showEditCodeDropdown, setShowEditCodeDropdown] = useState(false);
  const [editCodeSearchTerm, setEditCodeSearchTerm] = useState('');

  useEffect(() => {
    fetchDiagnoses();

    const channel = supabase
      .channel('diagnoses_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'diagnoses' },
        () => {
          fetchDiagnoses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDiagnoses = async () => {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching diagnoses:', error);
    } else {
      setDiagnoses(data || []);
    }
  };

  const addDiagnosis = async () => {
    if (!newDiagnosis.trim()) return;

    const { error } = await supabase
      .from('diagnoses')
      .insert([{ diagnosis: newDiagnosis, codes: selectedCodes }]);

    if (error) {
      console.error('Error adding diagnosis:', error);
    } else {
      setNewDiagnosis('');
      setSelectedCodes([]);
      setIsAddingDiagnosis(false);
      setShowCodeDropdown(false);
      setCodeSearchTerm('');
      fetchDiagnoses();
      triggerAnalysis(newDiagnosis);
    }
  };

  const triggerAnalysis = async (diagnosisText: string) => {
    try {
      const { data: conditions } = await supabase
        .from('conditions')
        .select('name');

      const { data: allergies } = await supabase
        .from('allergies')
        .select('name');

      const conditionsList = conditions?.map(c => c.name).join(', ') || 'None';
      const allergiesList = allergies?.map(a => a.name).join(', ') || 'None';

      const patientText = `
Patient Information:
Diagnosis: ${diagnosisText}
Conditions: ${conditionsList}
Allergies: ${allergiesList}
      `.trim();

      const result = await analyzePatient(patientText);

      (window as any).analysisResult = result;

      console.log('Analysis complete:', result);
    } catch (error) {
      console.error('Error analyzing patient:', error);
    }
  };

  const removeDiagnosis = async (id: string) => {
    setDiagnoses(diagnoses.filter(d => d.id !== id));

    const { error } = await supabase
      .from('diagnoses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting diagnosis:', error);
      fetchDiagnoses();
    }
  };

  const startEditing = (diagnosis: DiagnosisType) => {
    setEditingDiagnosisId(diagnosis.id);
    setEditDiagnosisText(diagnosis.diagnosis);
    setEditCodes(diagnosis.codes);
    setShowEditCodeDropdown(false);
    setEditCodeSearchTerm('');
  };

  const cancelEditing = () => {
    setEditingDiagnosisId(null);
    setEditDiagnosisText('');
    setEditCodes([]);
    setShowEditCodeDropdown(false);
    setEditCodeSearchTerm('');
  };

  const saveDiagnosis = async (id: string) => {
    if (!editDiagnosisText.trim()) return;

    const { error } = await supabase
      .from('diagnoses')
      .update({ diagnosis: editDiagnosisText, codes: editCodes })
      .eq('id', id);

    if (error) {
      console.error('Error updating diagnosis:', error);
    } else {
      cancelEditing();
      fetchDiagnoses();
    }
  };

  const toggleEditCode = (code: string) => {
    if (editCodes.includes(code)) {
      setEditCodes(editCodes.filter(c => c !== code));
    } else {
      setEditCodes([...editCodes, code]);
    }
  };

  const toggleCode = (code: string) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter(c => c !== code));
    } else {
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const filteredCodes = COMMON_ICD_CODES.filter(
    item =>
      item.code.toLowerCase().includes(codeSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(codeSearchTerm.toLowerCase())
  );

  const filteredEditCodes = COMMON_ICD_CODES.filter(
    item =>
      item.code.toLowerCase().includes(editCodeSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(editCodeSearchTerm.toLowerCase())
  );

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-stone-900">Diagnosis</h2>
            {diagnoses.length === 0 && (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          {!isAddingDiagnosis && (
            <button
              onClick={() => setIsAddingDiagnosis(true)}
              className={`flex items-center gap-2 transition-colors ${
                diagnoses.length === 0
                  ? 'text-red-600 hover:text-red-800 font-medium'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Diagnosis</span>
            </button>
          )}
        </div>

        {isAddingDiagnosis ? (
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3 space-y-2">
            <input
              type="text"
              value={newDiagnosis}
              onChange={(e) => setNewDiagnosis(e.target.value)}
              placeholder="Diagnosis description"
              className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded outline-none focus:border-stone-400"
              autoFocus
            />

            <div className="relative">
              <div
                className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded cursor-pointer"
                onClick={() => setShowCodeDropdown(!showCodeDropdown)}
              >
                {selectedCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedCodes.map((code, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                      >
                        {code}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-blue-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCode(code);
                          }}
                        />
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-stone-500">Select ICD codes (optional)</span>
                )}
              </div>

              {showCodeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-stone-300 rounded shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-stone-200">
                    <input
                      type="text"
                      value={codeSearchTerm}
                      onChange={(e) => setCodeSearchTerm(e.target.value)}
                      placeholder="Search codes..."
                      className="w-full px-2 py-1 text-xs bg-stone-50 border border-stone-300 rounded outline-none focus:border-stone-400"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCodes.map((item) => (
                      <div
                        key={item.code}
                        className={`px-3 py-2 text-xs cursor-pointer hover:bg-stone-100 ${
                          selectedCodes.includes(item.code) ? 'bg-blue-50' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCode(item.code);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCodes.includes(item.code)}
                            onChange={() => {}}
                            className="w-3 h-3"
                          />
                          <div>
                            <div className="font-medium text-stone-900">{item.code}</div>
                            <div className="text-stone-600">{item.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={addDiagnosis}
                className="px-3 py-1.5 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded transition-colors"
              >
                Add diagnosis
              </button>
              <button
                onClick={() => {
                  setIsAddingDiagnosis(false);
                  setNewDiagnosis('');
                  setSelectedCodes([]);
                  setShowCodeDropdown(false);
                  setCodeSearchTerm('');
                }}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-2 mt-3">
          {diagnoses.map((diagnosis) => (
            <div
              key={diagnosis.id}
              className="bg-stone-50 rounded-lg border border-stone-200 p-3"
            >
              {editingDiagnosisId === diagnosis.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editDiagnosisText}
                    onChange={(e) => setEditDiagnosisText(e.target.value)}
                    placeholder="Diagnosis description"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded outline-none focus:border-stone-400"
                    autoFocus
                  />

                  <div className="relative">
                    <div
                      className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded cursor-pointer"
                      onClick={() => setShowEditCodeDropdown(!showEditCodeDropdown)}
                    >
                      {editCodes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {editCodes.map((code, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                            >
                              {code}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-blue-900"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEditCode(code);
                                }}
                              />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-stone-500">Select ICD codes (optional)</span>
                      )}
                    </div>

                    {showEditCodeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-stone-300 rounded shadow-lg max-h-60 overflow-hidden">
                        <div className="p-2 border-b border-stone-200">
                          <input
                            type="text"
                            value={editCodeSearchTerm}
                            onChange={(e) => setEditCodeSearchTerm(e.target.value)}
                            placeholder="Search codes..."
                            className="w-full px-2 py-1 text-xs bg-stone-50 border border-stone-300 rounded outline-none focus:border-stone-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredEditCodes.map((item) => (
                            <div
                              key={item.code}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-stone-100 ${
                                editCodes.includes(item.code) ? 'bg-blue-50' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEditCode(item.code);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editCodes.includes(item.code)}
                                  onChange={() => {}}
                                  className="w-3 h-3"
                                />
                                <div>
                                  <div className="font-medium text-stone-900">{item.code}</div>
                                  <div className="text-stone-600">{item.description}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveDiagnosis(diagnosis.id)}
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
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => startEditing(diagnosis)}
                  >
                    <p className="font-medium text-stone-900">{diagnosis.diagnosis}</p>
                    {diagnosis.codes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {diagnosis.codes.map((code, idx) => {
                          const codeInfo = COMMON_ICD_CODES.find(c => c.code === code);
                          return (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                              title={codeInfo?.description}
                            >
                              {code}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeDiagnosis(diagnosis.id)}
                    className="p-1 hover:bg-stone-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-stone-500" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
