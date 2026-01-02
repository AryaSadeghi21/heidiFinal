/*
  # Create allergies table

  1. New Tables
    - `allergies`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `notes` (text, nullable)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
  
  2. Security
    - Enable RLS on `allergies` table
    - Add policy for public access (adjust based on your auth requirements)
*/

CREATE TABLE IF NOT EXISTS allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to allergies"
  ON allergies
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);