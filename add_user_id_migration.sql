-- Add user_id column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id text;

-- Add index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
