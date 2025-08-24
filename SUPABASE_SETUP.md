# Supabase Setup Guide

This guide will help you set up Supabase as your backend for the Kanban application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `karenban` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Set Up Database Tables

Go to **SQL Editor** in your Supabase dashboard and run these SQL commands:

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  category TEXT,
  priority TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  assigned_to TEXT,
  tags TEXT[],
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
CREATE POLICY "Allow all operations" ON tasks FOR ALL USING (true);
```

### Projects Table
```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations" ON projects FOR ALL USING (true);
```

### Team Members Table
```sql
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations" ON team_members FOR ALL USING (true);
```

## 4. Insert Sample Data

### Sample Projects
```sql
INSERT INTO projects (name, description, color, status, progress, total_tasks, completed_tasks) VALUES
('Website Redesign', 'Complete overhaul of company website', '#3B82F6', 'active', 65, 12, 8),
('Mobile App Development', 'Build iOS and Android apps', '#10B981', 'active', 30, 25, 7),
('Marketing Campaign', 'Q4 marketing push', '#F59E0B', 'on-hold', 0, 8, 0);
```

### Sample Team Members
```sql
INSERT INTO team_members (title, color) VALUES
('John Doe', '#EF4444'),
('Jane Smith', '#8B5CF6'),
('Mike Johnson', '#06B6D4'),
('Sarah Wilson', '#10B981');
```

### Sample Tasks
```sql
INSERT INTO tasks (title, description, status, category, priority, project_id, due_date, estimated_hours) VALUES
('Design Homepage', 'Create new homepage layout', 'in-progress', 'Design', 'high', 
 (SELECT id FROM projects WHERE name = 'Website Redesign'), NOW() + INTERVAL '7 days', 8),
('Setup Database', 'Configure backend database', 'todo', 'Backend', 'medium',
 (SELECT id FROM projects WHERE name = 'Mobile App Development'), NOW() + INTERVAL '3 days', 4),
('Write Copy', 'Create marketing copy for campaign', 'blocked', 'Content', 'low',
 (SELECT id FROM projects WHERE name = 'Marketing Campaign'), NOW() + INTERVAL '5 days', 6);
```

## 5. Test Your Setup

1. Start your development server: `npm run dev`
2. Check the browser console for any Supabase connection errors
3. Try creating a task or project
4. Verify data appears in your Supabase dashboard

## 6. Environment Variables for Production

When deploying to production (Vercel, Netlify, etc.), add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 7. Security Considerations

- **Row Level Security (RLS)** is enabled by default
- **Anonymous access** is allowed for now (good for demos)
- **Production apps** should implement proper authentication
- **API keys** are public but have limited permissions

## 8. Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check your `.env.local` file
2. **"Table doesn't exist"**: Run the SQL commands in order
3. **"RLS policy violation"**: Check your RLS policies
4. **"Connection timeout"**: Verify your project URL

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 9. Next Steps

Once Supabase is working:

1. **Add authentication** for user management
2. **Implement real-time subscriptions** for live updates
3. **Add file storage** for attachments
4. **Set up edge functions** for custom logic
5. **Configure backups** and monitoring

Your Kanban app is now powered by a production-ready PostgreSQL database! 🎉 