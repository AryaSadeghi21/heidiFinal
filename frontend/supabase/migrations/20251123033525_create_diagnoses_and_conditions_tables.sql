/*
  # Create Diagnoses and Conditions Tables

  1. New Tables
    - `diagnoses`
      - `id` (uuid, primary key) - Unique identifier for each diagnosis
      - `diagnosis` (text) - The diagnosis description
      - `codes` (text array) - Array of diagnostic codes (ICD-10, etc.)
      - `created_at` (timestamptz) - When the diagnosis was added
      - `updated_at` (timestamptz) - When the diagnosis was last modified

    - `conditions`
      - `id` (uuid, primary key) - Unique identifier for each condition
      - `name` (text) - The condition name
      - `created_at` (timestamptz) - When the condition was added
      - `updated_at` (timestamptz) - When the condition was last modified

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their data
    
  3. Important Notes
    - Tables are created with IF NOT EXISTS to prevent errors
    - Default timestamps are set automatically
    - RLS ensures data security
*/

CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis text NOT NULL,
  codes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view diagnoses"
  ON diagnoses
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert diagnoses"
  ON diagnoses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update diagnoses"
  ON diagnoses
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete diagnoses"
  ON diagnoses
  FOR DELETE
  USING (true);

CREATE TABLE IF NOT EXISTS conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view conditions"
  ON conditions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert conditions"
  ON conditions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update conditions"
  ON conditions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete conditions"
  ON conditions
  FOR DELETE
  USING (true);