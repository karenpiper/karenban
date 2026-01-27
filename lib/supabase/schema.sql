-- Supabase Database Schema for Karenban
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'blocked', 'done', 'uncategorized', 'today', 'delegated', 'later', 'completed', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday')),
  "columnId" TEXT,
  "categoryId" TEXT,
  "projectId" TEXT,
  client TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "completedAt" TIMESTAMP WITH TIME ZONE,
  "dueDate" TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  "estimatedHours" DOUBLE PRECISION,
  "actualHours" DOUBLE PRECISION,
  "assignedTo" TEXT,
  notes TEXT,
  category TEXT,
  "durationDays" INTEGER,
  "durationHours" DOUBLE PRECISION,
  "startDate" TIMESTAMP WITH TIME ZONE
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'on-hold')),
  client TEXT,
  archived BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "dueDate" TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  "totalTasks" INTEGER DEFAULT 0,
  "completedTasks" INTEGER DEFAULT 0
);

-- Columns table
CREATE TABLE IF NOT EXISTS columns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  color TEXT NOT NULL,
  "maxTasks" INTEGER,
  "allowsDynamicCategories" BOOLEAN DEFAULT FALSE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "columnId" TEXT NOT NULL,
  color TEXT NOT NULL,
  "isCollapsed" BOOLEAN DEFAULT FALSE,
  "order" INTEGER NOT NULL,
  "taskCount" INTEGER DEFAULT 0,
  "completedCount" INTEGER DEFAULT 0,
  "isPerson" BOOLEAN DEFAULT FALSE,
  "personName" TEXT,
  archived BOOLEAN DEFAULT FALSE,
  "isTeamMember" BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("columnId") REFERENCES columns(id) ON DELETE CASCADE
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  "isUnlocked" BOOLEAN DEFAULT FALSE,
  progress INTEGER DEFAULT 0,
  "maxProgress" INTEGER NOT NULL,
  "unlockedAt" TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL CHECK (type IN ('streak', 'completion', 'focus', 'consistency', 'milestone'))
);

-- Daily Stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT PRIMARY KEY, -- YYYY-MM-DD format
  "tasksCompleted" INTEGER DEFAULT 0,
  "tasksCreated" INTEGER DEFAULT 0,
  "focusTimeMinutes" INTEGER DEFAULT 0,
  "completionRate" INTEGER DEFAULT 0,
  "streakDay" INTEGER DEFAULT 0,
  "startTime" TEXT,
  "endTime" TEXT
);

-- User Stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id TEXT PRIMARY KEY DEFAULT 'default',
  "totalTasksCompleted" INTEGER DEFAULT 0,
  "totalFocusHours" DOUBLE PRECISION DEFAULT 0,
  "currentStreak" INTEGER DEFAULT 0,
  "longestStreak" INTEGER DEFAULT 0,
  "averageCompletionRate" DOUBLE PRECISION DEFAULT 0,
  "totalAchievements" INTEGER DEFAULT 0,
  "lastActiveDate" TEXT NOT NULL DEFAULT CURRENT_DATE::TEXT
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  "enableAnimations" BOOLEAN DEFAULT TRUE,
  "enableNotifications" BOOLEAN DEFAULT TRUE,
  "workingHoursStart" TEXT DEFAULT '09:00',
  "workingHoursEnd" TEXT DEFAULT '17:00',
  "dailyGoal" INTEGER DEFAULT 8
);

-- Role Growth Goals table
CREATE TABLE IF NOT EXISTS role_growth_goals (
  id TEXT PRIMARY KEY,
  discipline TEXT NOT NULL,
  level TEXT NOT NULL,
  title TEXT NOT NULL,
  "firstPersonStatement" TEXT,
  behaviors TEXT[] DEFAULT '{}',
  competency TEXT,
  "skillsAndDeliverables" TEXT[] DEFAULT '{}',
  description TEXT,
  category TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Member Details table
CREATE TABLE IF NOT EXISTS team_member_details (
  name TEXT PRIMARY KEY,
  team TEXT, -- e.g., "Brand Strategy", "Brand Intelligence"
  manager TEXT, -- Name of the manager (references another team member)
  "headOf" TEXT, -- Name of the team/person they are head of
  discipline TEXT,
  level TEXT,
  morale TEXT CHECK (morale IN ('excellent', 'good', 'fair', 'poor')),
  performance TEXT CHECK (performance IN ('excellent', 'good', 'fair', 'poor')),
  clients TEXT[] DEFAULT '{}',
  "redFlags" TEXT[] DEFAULT '{}',
  notes TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "growthGoals" JSONB DEFAULT '[]',
  "goals" JSONB DEFAULT '[]',
  "clientDetails" JSONB DEFAULT '{}',
  "reviewCycles" JSONB DEFAULT '[]',
  "oneOnOnes" JSONB DEFAULT '[]',
  "moraleCheckIns" JSONB DEFAULT '[]',
  "performanceCheckIns" JSONB DEFAULT '[]'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_columnId ON tasks("columnId");
CREATE INDEX IF NOT EXISTS idx_tasks_categoryId ON tasks("categoryId");
CREATE INDEX IF NOT EXISTS idx_tasks_projectId ON tasks("projectId");
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignedTo ON tasks("assignedTo");
CREATE INDEX IF NOT EXISTS idx_categories_columnId ON categories("columnId");
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client);
CREATE INDEX IF NOT EXISTS idx_role_growth_goals_discipline_level ON role_growth_goals(discipline, level);

-- Enable Row Level Security (RLS) - for now, disable for development
-- You can enable this later for production
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_growth_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_details DISABLE ROW LEVEL SECURITY;
