-- Add manager column to team_member_details table
-- Run this in your Supabase SQL Editor if the table already exists

ALTER TABLE team_member_details ADD COLUMN IF NOT EXISTS manager TEXT;
