import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  User,
  Pill,
  Shield,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { AnalysisResult } from '../lib/api';

interface AgentsViewProps {
  result: AnalysisResult | null;
  loading: boolean;
}

export default function AgentsView({ result, loading }: AgentsViewProps) {
  const [expandedAgent, setExpandedAgent] = useState<number | null>(0);

  const toggleAgent = (agentNum: number) => {
    setExpandedAgent(expandedAgent === agentNum ? null : agentNum);
  };

  return (
    <div className="relative h-full bg-stone-50 overflow-hidden">
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-stone-300 border-t-blue-600"></div>
            <p className="text-stone-700 font-medium">Analyzing (20s)…</p>
          </div>
        </div>
      )}

      {/* NO RESULT YET */}
      {!result && !loading && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-900 mb-2">No Agent Analysis Yet</h2>
            <p className="text-stone-600">
              Add a diagnosis to trigger the agent pipeline and see the analysis results here.
            </p>
          </div>
        </div>
      )}

      {/* RESULT DISPLAY */}
      {result && (
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">

            {/* AGENT 0 */}
            <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleAgent(0)}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-stone-900">Agent 0: Patient Data Extraction</h3>
                    <p className="text-sm text-stone-600">
                      Extracts and structures patient information
                    </p>
                  </div>
                </div>
                {expandedAgent === 0 ? (
                  <ChevronDown className="w-5 h-5 text-stone-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                )}
              </button>

              {expandedAgent === 0 && (
                <div className="border-t border-stone-200 p-4 bg-stone-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-stone-600 uppercase">
                        Diagnosis
                      </label>
                      <p className="text-sm text-stone-900 mt-1">
                        {result.agent0_output.diagnosis || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold text-stone-600 uppercase">
                      Conditions
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.agent0_output.conditions.length > 0 ? (
                        result.agent0_output.conditions.map((condition, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                          >
                            {condition}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-stone-500">None</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold text-stone-600 uppercase">
                      Allergies
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.agent0_output.allergies.length > 0 ? (
                        result.agent0_output.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-200"
                          >
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-stone-500">None</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AGENT 1 */}
            <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleAgent(1)}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-stone-900">Agent 1: Treatment Recommendations</h3>
                    <p className="text-sm text-stone-600">
                      Suggests candidate treatments for the diagnosis
                    </p>
                  </div>
                </div>
                {expandedAgent === 1 ? (
                  <ChevronDown className="w-5 h-5 text-stone-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                )}
              </button>

              {expandedAgent === 1 && (
                <div className="border-t border-stone-200 p-4 bg-stone-50">
                  <label className="text-xs font-semibold text-stone-600 uppercase">Diagnosis</label>
                  <p className="text-sm text-stone-900 mt-1">{result.agent1_output.diagnosis}</p>

                  <label className="text-xs font-semibold text-stone-600 uppercase mt-4 block">
                    Candidate Treatments
                  </label>
                  <div className="mt-2 space-y-2">
                    {result.agent1_output.candidate_treatments.map((treatment, idx) => (
                      <div key={idx} className="bg-white rounded-lg border border-stone-200 px-4 py-3">
                        <p className="text-sm text-stone-900 capitalize">{treatment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AGENT 2 */}
            <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleAgent(2)}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-stone-900">Agent 2: Safety Validation</h3>
                    <p className="text-sm text-stone-600">
                      Validates medications against allergies and conditions
                    </p>
                  </div>
                </div>
                {expandedAgent === 2 ? (
                  <ChevronDown className="w-5 h-5 text-stone-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                )}
              </button>

              {expandedAgent === 2 && (
                <div className="border-t border-stone-200 p-4 bg-stone-50">
                  <label className="text-xs font-semibold text-stone-600 uppercase">
                    Diagnosis
                  </label>
                  <p className="text-sm text-stone-900 mt-1">{result.agent2_output.diagnosis}</p>

                  {result.agent2_output.valid_drugs.length > 0 && (
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-green-700 uppercase flex items-center gap-1 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        Valid Medications ({result.agent2_output.valid_drugs.length})
                      </label>
                      <div className="space-y-2">
                        {result.agent2_output.valid_drugs.map((drug, idx) => (
                          <div key={idx} className="bg-green-50 rounded-lg border border-green-200 px-4 py-3">
                            <p className="text-sm font-medium text-green-900 capitalize">{drug}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.agent2_output.invalid_drugs.length > 0 && (
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-red-700 uppercase flex items-center gap-1 mb-2">
                        <XCircle className="w-4 h-4" />
                        Invalid Medications ({result.agent2_output.invalid_drugs.length})
                      </label>
                      <div className="space-y-2">
                        {result.agent2_output.invalid_drugs.map((drug, idx) => (
                          <div key={idx} className="bg-red-50 rounded-lg border border-red-200 px-4 py-3">
                            <p className="text-sm font-medium text-red-900 capitalize">{drug}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(result.agent2_output.links).length > 0 && (
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-stone-600 uppercase mb-2 block">
                        Research Links
                      </label>
                      <div className="space-y-2">
                        {Object.entries(result.agent2_output.links).map(([title, url], idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors group bg-white rounded-lg border border-stone-200 px-4 py-3"
                          >
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            <span className="group-hover:underline">{title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
