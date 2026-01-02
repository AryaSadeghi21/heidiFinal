/*
  # Add notes field to conditions table

  1. Changes
    - Add `notes` column to `conditions` table to store detailed information about each condition
  
  2. Notes
    - Using text type to allow for long-form notes
    - Nullable field with no default value
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'notes'
  ) THEN
    ALTER TABLE conditions ADD COLUMN notes text;
  END IF;
END $$;