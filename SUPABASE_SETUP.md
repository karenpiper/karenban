# Supabase Setup Instructions

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Never expose the service role key on the client side
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Getting Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Paste them into your `.env.local` file

## Database Schema

The following tables will be created in your Supabase project:

- `tasks` - Kanban tasks with status, category, personId, etc.
- `people` - People for follow-up categories
- `projects` - Project management
- `team_members` - Team member information

## Authentication

This setup uses cookie-based authentication with automatic session refresh.
The middleware will handle session management automatically. 