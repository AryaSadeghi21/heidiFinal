const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface AnalysisResult {
  agent0_output: {
    name: string;
    dob: string;
    age: number | null;
    sex: string;
    pregnant: boolean;
    allergies: string[];
    conditions: string[];
    diagnosis: string;
  };
  agent1_output: {
    diagnosis: string;
    candidate_treatments: string[];
  };
  agent2_output: {
    diagnosis: string;
    valid_drugs: string[];
    invalid_drugs: string[];
    links: Record<string, string>;
  };
}

export async function analyzePatient(patientText: string): Promise<AnalysisResult> {
  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: patientText }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze patient data');
  }

  return response.json();
}
