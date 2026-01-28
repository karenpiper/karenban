-- Migration script to update team_member_details schema
-- Run this in your Supabase SQL Editor

-- 1. Add manager field if it doesn't exist (should already exist, but ensure it)
ALTER TABLE team_member_details 
ADD COLUMN IF NOT EXISTS manager TEXT;

-- 2. Add startDate field for tenure tracking
ALTER TABLE team_member_details 
ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP WITH TIME ZONE;

-- 3. Add lastPromoDate field
ALTER TABLE team_member_details 
ADD COLUMN IF NOT EXISTS "lastPromoDate" TIMESTAMP WITH TIME ZONE;

-- 4. Convert redFlags from TEXT[] to JSONB with structure
-- First, create a temporary column for the new structure
ALTER TABLE team_member_details 
ADD COLUMN IF NOT EXISTS "redFlagsNew" JSONB DEFAULT '[]';

-- Migrate existing redFlags data to new structure
-- This converts each string to {text: string, date: now, status: 'open'}
UPDATE team_member_details
SET "redFlagsNew" = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', gen_random_uuid()::text,
        'text', flag,
        'date', NOW(),
        'status', 'open',
        'createdAt', NOW()
      )
    ),
    '[]'::jsonb
  )
  FROM unnest(COALESCE("redFlags", ARRAY[]::TEXT[])) AS flag
)
WHERE "redFlags" IS NOT NULL AND array_length("redFlags", 1) > 0;

-- Set default empty array for rows with no red flags
UPDATE team_member_details
SET "redFlagsNew" = '[]'::jsonb
WHERE "redFlagsNew" IS NULL;

-- Drop old redFlags column
ALTER TABLE team_member_details 
DROP COLUMN IF EXISTS "redFlags";

-- Rename new column to redFlags
ALTER TABLE team_member_details 
RENAME COLUMN "redFlagsNew" TO "redFlags";

-- 5. Remove discipline column (keeping only team)
ALTER TABLE team_member_details 
DROP COLUMN IF EXISTS discipline;

-- Add index for manager lookups
CREATE INDEX IF NOT EXISTS idx_team_member_details_manager ON team_member_details(manager);

-- Add index for team lookups
CREATE INDEX IF NOT EXISTS idx_team_member_details_team ON team_member_details(team);
