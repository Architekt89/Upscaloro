-- Add daily usage tracking fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS images_processed_today INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS last_processing_date DATE DEFAULT CURRENT_DATE;
