/*
  # Add Task Details Fields

  1. Changes to Tables
    - Add columns to `tasks` table:
      - `notes` (text) - Detailed notes and description for the task
      - `evidence_link` (text) - URL or reference to supporting evidence
      - `warnings` (text[]) - Array of warning messages (e.g., medication allergies)
      - `document_generated` (boolean) - Tracks if document has been generated
      
  2. Notes
    - All new columns are nullable to support existing tasks
    - Using text array for warnings to allow multiple warnings per task
    - Default false for document_generated flag
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'notes'
  ) THEN
    ALTER TABLE tasks ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'evidence_link'
  ) THEN
    ALTER TABLE tasks ADD COLUMN evidence_link text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'warnings'
  ) THEN
    ALTER TABLE tasks ADD COLUMN warnings text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'document_generated'
  ) THEN
    ALTER TABLE tasks ADD COLUMN document_generated boolean DEFAULT false;
  END IF;
END $$;