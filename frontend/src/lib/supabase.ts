import { createClient } from '@supabase/supabase-js';

const VITE_supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const VITE_supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_KEY;



export const supabase = createClient(VITE_supabaseUrl, VITE_supabaseAnonKey);

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  notes?: string | null;
  evidence_link?: string | null;
  warnings?: string[] | null;
  document_generated?: boolean;
};

export type Diagnosis = {
  id: string;
  diagnosis: string;
  codes: string[];
  created_at: string;
  updated_at: string;
};

export type Condition = {
  id: string;
  name: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type Allergy = {
  id: string;
  name: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};
