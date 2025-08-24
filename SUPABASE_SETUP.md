# Supabase Setup Guide for KarenBan

This guide will help you set up Supabase with proper client/server separation, cookie-based authentication, and a comprehensive database schema.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 2. Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**⚠️ Important**: Never expose your service role key on the client side!

### 3. Database Setup

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL script

## 🏗️ Architecture

### Client-Side (Browser)
- **File**: `lib/supabase/client.ts`
- **Usage**: Use in React components, event handlers, etc.
- **Features**: Cookie-based auth, automatic token refresh

### Server-Side (Server Components/API Routes)
- **File**: `lib/supabase/server.ts`
- **Usage**: Use in Server Components, API routes, middleware
- **Features**: Server-side auth, secure cookie handling

### Middleware
- **File**: `middleware.ts`
- **Purpose**: Handles auth token refresh and session management
- **Automatic**: Runs on every request

## 📊 Database Schema

### Core Tables

#### **Tasks**
- Full task management with status, priority, assignments
- Project relationships and dependencies
- Time tracking (estimated vs actual hours)
- Tags and metadata support

#### **Projects**
- Project lifecycle management
- Team member assignments
- Progress tracking with automatic task counting
- Due dates and status management

#### **Team Members**
- User management with roles and departments
- Manager hierarchies
- Contact information and preferences
- Active/inactive status tracking

#### **Notes**
- Rich note-taking system
- Attachable to tasks, projects, or team members
- Private/public visibility controls
- Tagging and search capabilities

#### **One-on-One Sessions**
- Meeting scheduling and management
- Agenda and notes tracking
- Follow-up requirements
- Integration with feedback system

#### **Feedback System**
- Multi-type feedback (positive, constructive, critical)
- Anonymous feedback support
- Task and project context
- Public/private visibility controls

#### **Performance Management**
- Issue tracking and resolution
- Severity levels and status management
- Action plans and follow-ups
- Integration with review system

#### **Review Packets**
- Comprehensive performance reviews
- Multi-dimensional ratings
- Goal setting and tracking
- Period-based review cycles

#### **Activity Logging**
- Complete audit trail
- User action tracking
- Entity relationship logging
- IP and user agent tracking

### Advanced Features

#### **Automatic Triggers**
- `updated_at` timestamps on all tables
- Project task count updates
- Activity logging automation

#### **Full-Text Search**
- Task and project content search
- Note content search
- Optimized with GIN indexes

#### **Performance Indexes**
- Status and priority filtering
- Date-based queries
- User assignment lookups
- Composite indexes for common queries

#### **Row Level Security (RLS)**
- Enabled on all tables
- Configurable policies
- Secure by default

## 🔧 Usage Examples

### Client-Side Usage

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export default function TaskComponent() {
  const supabase = createClient()
  
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'todo')
    
    if (error) console.error('Error:', error)
    else console.log('Tasks:', data)
  }
  
  return (
    <button onClick={fetchTasks}>
      Fetch Tasks
    </button>
  )
}
```

### Server-Side Usage

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = createClient()
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'todo')
  
  return (
    <div>
      {tasks?.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
```

### Type Safety

```tsx
import type { Database } from '@/lib/database.types'

type Task = Database['public']['Tables']['tasks']['Row']
type NewTask = Database['public']['Tables']['tasks']['Insert']

const createTask = async (task: NewTask) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
  
  return { data, error }
}
```

## 🧪 Testing

### Dev Test Page

Visit `/dev/supa-test` to test your Supabase connection:

1. **Success**: Green box with "Connection Successful!"
2. **Error**: Red box with detailed error information
3. **Exception**: Red box with exception details

### Database Connection Test

The test page runs:
```sql
SELECT * FROM tasks LIMIT 1
```

This verifies:
- ✅ Environment variables are set correctly
- ✅ Supabase connection is working
- ✅ Database schema is properly set up
- ✅ RLS policies allow access

## 🔒 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Default policies allow all operations (customize for production)
- Secure by design

### Authentication
- Cookie-based auth with automatic refresh
- Secure token handling
- Middleware protection

### Data Validation
- Enum constraints for status fields
- Check constraints for numeric ranges
- Foreign key relationships
- UUID primary keys

## 📈 Performance Optimizations

### Indexes
- **Status indexes**: Fast filtering by task/project status
- **Date indexes**: Efficient date range queries
- **Composite indexes**: Optimized for common query patterns
- **Full-text search**: GIN indexes for content search

### Triggers
- **Automatic timestamps**: Always up-to-date `updated_at` fields
- **Task counting**: Real-time project task statistics
- **Activity logging**: Automatic audit trail

### Functions
- **Activity logging**: Centralized logging function
- **Task count updates**: Automatic project statistics

## 🚀 Production Considerations

### Environment Variables
```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Production (add to your hosting platform)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### RLS Policies
Customize RLS policies based on your authentication needs:

```sql
-- Example: Users can only see their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
FOR SELECT USING (auth.uid()::text = assigned_to);

-- Example: Users can only edit their own tasks
CREATE POLICY "Users can edit own tasks" ON tasks
FOR UPDATE USING (auth.uid()::text = assigned_to);
```

### Monitoring
- Use Supabase dashboard for query performance
- Monitor RLS policy effectiveness
- Track API usage and limits

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check `.env.local` file
   - Verify environment variables are loaded
   - Restart development server

2. **"Table doesn't exist"**
   - Run the schema SQL in Supabase dashboard
   - Check table names match exactly
   - Verify RLS policies

3. **"RLS policy violation"**
   - Check RLS policies in Supabase dashboard
   - Verify user authentication
   - Test with basic policies first

4. **"Connection timeout"**
   - Verify Supabase project is active
   - Check network connectivity
   - Verify project URL is correct

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 🎯 Next Steps

1. **Set up authentication** with Supabase Auth
2. **Customize RLS policies** for your use case
3. **Add real-time subscriptions** for live updates
4. **Implement file storage** for attachments
5. **Set up edge functions** for custom logic

Your Kanban app now has a production-ready, type-safe database with comprehensive features! 🎉 