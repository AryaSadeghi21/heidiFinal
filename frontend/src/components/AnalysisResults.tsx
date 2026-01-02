import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { AnalysisResult } from '../lib/api';

interface AnalysisResultsProps {
  result: AnalysisResult | null;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  if (!result) return null;

  const { agent2_output, agent4_output } = result;

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Medication Analysis</h2>

        {/* VALID MEDS */}
        {agent2_output.valid_drugs.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Valid Medications ({agent2_output.valid_drugs.length})
            </h3>
            <div className="space-y-1">
              {agent2_output.valid_drugs.map((drug, index) => (
                <div
                  key={index}
                  className="bg-green-50 rounded-lg border border-green-200 px-3 py-2"
                >
                  <p className="text-sm font-medium text-green-900 capitalize">{drug}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        

        {/* AGENT 4 RESEARCH ONLY */}
        {agent4_output?.research?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-stone-900 mb-2">
              Medical Research
            </h3>
            <div className="space-y-2">
              {agent4_output.research.map((paper, index) => (
                <a
                  key={index}
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 group"
                >
                  <ExternalLink className="w-5 h-5 flex-shrink-0" />

                  {/* Ellipsis for long titles */}
                  <span className="group-hover:underline block truncate max-w-[260px]">
                    {paper.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
