# Supabase Setup Guide

This guide will help you set up Supabase for your Kanban application, which provides a PostgreSQL database with real-time capabilities, authentication, and more.

## 🚀 Why Supabase?

- **PostgreSQL Database** - Enterprise-grade database
- **Real-time Subscriptions** - Live updates across all clients
- **Built-in Authentication** - User management and security
- **Auto-generated APIs** - REST and GraphQL APIs
- **Beautiful Dashboard** - Easy data management
- **Free Tier** - Generous free plan for development
- **Edge Functions** - Serverless functions
- **Row Level Security** - Fine-grained access control

## 📋 Prerequisites

1. **Node.js** (version 18 or higher)
2. **Git** for version control
3. **A Supabase account** (free at [supabase.com](https://supabase.com))

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
# Install Supabase client
pnpm add @supabase/supabase-js

# Install Prisma (optional, for database management)
pnpm add prisma @prisma/client
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `karenban` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"
6. Wait for setup to complete (2-3 minutes)

### 3. Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

### 4. Set Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Database URL for Prisma (optional)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 5. Create Database Tables

You have two options:

#### Option A: Use Supabase Dashboard (Recommended)

1. Go to **Table Editor** in your Supabase dashboard
2. Click **New Table** and create each table:

**Task Table:**
```sql
create table "Task" (
  "id" text primary key,
  "title" text not null,
  "description" text,
  "priority" text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  "status" text not null check (status in ('todo', 'in_progress', 'blocked', 'done')),
  "columnId" text not null,
  "categoryId" text not null,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now(),
  "completedAt" timestamp with time zone,
  "dueDate" timestamp with time zone,
  "tags" text default '[]',
  "estimatedHours" double precision,
  "actualHours" double precision,
  "assignedTo" text
);
```

**Category Table:**
```sql
create table "Category" (
  "id" text primary key,
  "name" text not null,
  "columnId" text not null,
  "color" text not null,
  "isCollapsed" boolean default false,
  "order" integer not null,
  "taskCount" integer default 0,
  "completedCount" integer default 0,
  "isPerson" boolean default false,
  "personName" text
);
```

**Column Table:**
```sql
create table "Column" (
  "id" text primary key,
  "name" text not null,
  "order" integer not null,
  "color" text not null,
  "maxTasks" integer,
  "allowsDynamicCategories" boolean default false
);
```

**Achievement Table:**
```sql
create table "Achievement" (
  "id" text primary key,
  "name" text not null,
  "description" text not null,
  "icon" text not null,
  "color" text not null,
  "isUnlocked" boolean default false,
  "progress" integer not null,
  "maxProgress" integer not null,
  "unlockedAt" timestamp with time zone,
  "type" text not null check (type in ('streak', 'completion', 'focus', 'consistency', 'milestone'))
);
```

**DailyStats Table:**
```sql
create table "DailyStats" (
  "id" text primary key,
  "date" text not null unique,
  "tasksCompleted" integer not null,
  "tasksCreated" integer not null,
  "focusTimeMinutes" integer not null,
  "completionRate" integer not null,
  "streakDay" integer not null,
  "startTime" text,
  "endTime" text
);
```

**UserStats Table:**
```sql
create table "UserStats" (
  "id" text primary key,
  "totalTasksCompleted" integer default 0,
  "totalFocusHours" double precision default 0,
  "currentStreak" integer default 0,
  "longestStreak" integer default 0,
  "averageCompletionRate" double precision default 0,
  "totalAchievements" integer default 0,
  "lastActiveDate" text not null
);
```

**Settings Table:**
```sql
create table "Settings" (
  "id" text primary key,
  "theme" text default 'auto',
  "enableAnimations" boolean default true,
  "enableNotifications" boolean default true,
  "workingHoursStart" text default '09:00',
  "workingHoursEnd" text default '17:00',
  "dailyGoal" integer default 8
);
```

#### Option B: Use Prisma (Advanced)

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to Supabase
pnpm db:push
```

### 6. Set Up Row Level Security (RLS)

For production, you'll want to enable RLS. In the Supabase dashboard:

1. Go to **Authentication** → **Policies**
2. Enable RLS on each table
3. Create policies for your use case

For development, you can disable RLS temporarily.

### 7. Seed the Database

```bash
# Run the Supabase seeder
pnpm tsx lib/supabase-seeder.ts
```

### 8. Test the Setup

Start your development server:

```bash
pnpm dev
```

## 🔧 Usage in Components

### Basic Usage

```tsx
import { useSupabase } from '../hooks/use-supabase'

function MyComponent() {
  const { createTask, updateTask, isLoading, error } = useSupabase()
  
  const handleCreate = async () => {
    const newTask = await createTask({
      title: 'New Task',
      priority: 'medium',
      status: 'todo',
      columnId: 'col-standing',
      categoryId: 'cat-daily-routines',
    })
  }
}
```

### Real-time Updates

```tsx
import { useEffect } from 'react'
import { useSupabase } from '../hooks/use-supabase'

function RealTimeComponent() {
  const { subscribeToTasks } = useSupabase()
  
  useEffect(() => {
    const unsubscribe = subscribeToTasks((payload) => {
      console.log('Task updated:', payload)
      // Handle real-time updates
    })
    
    return unsubscribe
  }, [subscribeToTasks])
}
```

## 🚀 Advanced Features

### 1. Authentication

```tsx
import { supabase } from '../lib/supabase'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
await supabase.auth.signOut()
```

### 2. Row Level Security

```sql
-- Example policy for tasks
create policy "Users can view their own tasks"
on "Task"
for select
using (auth.uid()::text = "assignedTo");

create policy "Users can insert their own tasks"
on "Task"
for insert
with check (auth.uid()::text = "assignedTo");
```

### 3. Edge Functions

Create serverless functions in the Supabase dashboard:

```typescript
// supabase/functions/process-task/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { taskId } = await req.json()
  
  // Process task logic here
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

## 📊 Monitoring & Analytics

1. **Database**: View query performance in **Logs** → **Database**
2. **API**: Monitor API usage in **Logs** → **API**
3. **Realtime**: Check real-time connections in **Realtime**
4. **Storage**: Monitor file uploads in **Storage**

## 🔒 Security Best Practices

1. **Enable RLS** on all tables
2. **Use environment variables** for sensitive data
3. **Validate input** on both client and server
4. **Limit API access** with proper policies
5. **Regular security audits** of your policies

## 🚀 Deployment

### Vercel

1. Add environment variables in Vercel dashboard
2. Deploy your Next.js app
3. Supabase automatically scales

### Other Platforms

- **Netlify**: Add environment variables in dashboard
- **Railway**: Use Railway's environment variable system
- **Self-hosted**: Set environment variables on your server

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check your environment variables
2. **"Table doesn't exist"**: Verify table creation in Supabase dashboard
3. **"RLS policy violation"**: Check your Row Level Security policies
4. **"Connection timeout"**: Verify your Supabase project is active

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 🎯 Next Steps

After setting up Supabase:

1. **Add authentication** to your app
2. **Implement real-time updates** for collaborative features
3. **Add user management** and permissions
4. **Set up monitoring** and alerts
5. **Optimize queries** for performance
6. **Add backup strategies** for production

## 💰 Pricing

- **Free Tier**: 500MB database, 2GB bandwidth, 50MB file storage
- **Pro**: $25/month for 8GB database, 250GB bandwidth, 100GB storage
- **Team**: $599/month for 100GB database, 2TB bandwidth, 1TB storage

The free tier is perfect for development and small projects! 