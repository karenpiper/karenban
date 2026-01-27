-- Add team column to existing team_member_details table
-- Run this in your Supabase SQL Editor if the table already exists

ALTER TABLE team_member_details 
ADD COLUMN IF NOT EXISTS team TEXT;

-- Set default team for existing members (you can update this)
-- UPDATE team_member_details SET team = 'Brand Strategy' WHERE team IS NULL;
