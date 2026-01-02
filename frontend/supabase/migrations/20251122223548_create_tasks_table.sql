/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key) - Unique identifier for each task
      - `title` (text) - The task title/description
      - `completed` (boolean) - Whether the task is completed
      - `created_at` (timestamptz) - When the task was created
      - `updated_at` (timestamptz) - When the task was last updated
      
  2. Security
    - Enable RLS on `tasks` table
    - Add policy for anyone to read all tasks
    - Add policy for anyone to insert tasks
    - Add policy for anyone to update tasks
    - Add policy for anyone to delete tasks
    
  Note: Using permissive policies for simplicity. In production, these should be restricted to authenticated users.
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tasks"
  ON tasks
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks
  FOR DELETE
  USING (true);