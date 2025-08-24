# Database Setup Guide

This guide will help you set up a database for your Kanban application using Prisma with SQLite.

## Prerequisites

Before you begin, you need to have Node.js installed on your system. If you don't have it:

1. **Install Homebrew** (macOS package manager):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js**:
   ```bash
   brew install node
   ```

3. **Install pnpm** (package manager):
   ```bash
   npm install -g pnpm
   ```

## Installation Steps

### 1. Install Dependencies

Once Node.js is installed, run:

```bash
pnpm install
```

### 2. Install Prisma

```bash
pnpm add prisma @prisma/client
```

### 3. Initialize Prisma

```bash
npx prisma init
```

### 4. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
DATABASE_URL="file:./dev.db"
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Create and Migrate Database

```bash
npx prisma db push
```

### 7. Seed the Database

```bash
npx prisma db seed
```

If the seed command doesn't work, you can run the seeder manually:

```bash
npx tsx lib/seed-database.ts
```

## Database Schema

The database includes the following models:

- **Task**: Individual tasks with priority, status, and metadata
- **Category**: Task categories within columns
- **Column**: Kanban board columns
- **Achievement**: User achievements and progress tracking
- **DailyStats**: Daily productivity statistics
- **UserStats**: Overall user statistics
- **Settings**: Application settings and preferences

## API Endpoints

The following API endpoints are available:

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a specific task
- `PUT /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

### Columns
- `GET /api/columns` - Get all columns with categories and tasks
- `POST /api/columns` - Create a new column

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category

## Usage in Components

Use the `useDatabase` hook in your React components:

```tsx
import { useDatabase } from '../hooks/use-database'

function MyComponent() {
  const { createTask, updateTask, deleteTask, isLoading, error } = useDatabase()

  const handleCreateTask = async () => {
    const newTask = await createTask({
      title: 'New Task',
      priority: 'medium',
      status: 'todo',
      columnId: 'col-standing',
      categoryId: 'cat-daily-routines',
    })
    
    if (newTask) {
      console.log('Task created:', newTask)
    }
  }

  return (
    <div>
      <button onClick={handleCreateTask} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Task'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
```

## Database Management

### View Database

To view your database in a GUI:

```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can view and edit your data.

### Reset Database

To reset your database and re-seed:

```bash
npx prisma db push --force-reset
npx tsx lib/seed-database.ts
```

### Migrations

For production use, you should use migrations instead of `db push`:

```bash
npx prisma migrate dev --name init
```

## Production Considerations

For production deployment:

1. **Switch to PostgreSQL**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Environment Variables**: Set `DATABASE_URL` to your production database connection string

3. **Migrations**: Use `prisma migrate deploy` in production

4. **Connection Pooling**: Consider using connection pooling for better performance

## Troubleshooting

### Common Issues

1. **"prisma command not found"**: Make sure you've installed Prisma as a dev dependency
2. **Database connection errors**: Check your `.env.local` file and database URL
3. **Type errors**: Run `npx prisma generate` after schema changes

### Getting Help

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma GitHub Issues](https://github.com/prisma/prisma/issues)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## Next Steps

After setting up the database:

1. Update your components to use the `useDatabase` hook instead of localStorage
2. Implement real-time updates using Next.js Server-Sent Events or WebSockets
3. Add authentication and user management
4. Implement data validation and error handling
5. Add database backups and monitoring 