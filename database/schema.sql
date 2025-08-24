-- Supabase Database Schema for KarenBan
-- This schema is idempotent and can be run multiple times safely

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types and enums
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'todo', 'in_progress', 'blocked', 'done', 'delegated',
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE feedback_type AS ENUM ('positive', 'constructive', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE performance_rating AS ENUM ('exceeds', 'meets', 'below', 'needs_improvement');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM ('task_created', 'task_completed', 'task_delegated', 'note_added', 'feedback_given', 'session_scheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    status project_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    owner_id UUID,
    team_members UUID[],
    tags TEXT[],
    metadata JSONB
);

-- Team members/delegates table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    email VARCHAR(255) UNIQUE,
    role VARCHAR(100),
    department VARCHAR(100),
    manager_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    phone VARCHAR(20),
    location VARCHAR(100),
    timezone VARCHAR(50),
    metadata JSONB
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    category VARCHAR(100),
    priority task_priority NOT NULL DEFAULT 'medium',
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT[],
    notes TEXT,
    dependencies UUID[],
    metadata JSONB
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_private BOOLEAN DEFAULT false,
    tags TEXT[],
    metadata JSONB
);

-- One-on-one sessions table
CREATE TABLE IF NOT EXISTS one_on_one_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    meeting_url TEXT,
    agenda TEXT[],
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Feedback entries table
CREATE TABLE IF NOT EXISTS feedback_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    feedback_type feedback_type NOT NULL,
    giver_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    session_id UUID REFERENCES one_on_one_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_anonymous BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    tags TEXT[],
    metadata JSONB
);

-- Performance issues table
CREATE TABLE IF NOT EXISTS performance_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    employee_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'addressing', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
    action_plan TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    metadata JSONB
);

-- Review packets table
CREATE TABLE IF NOT EXISTS review_packets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    employee_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    overall_rating performance_rating,
    goals_rating performance_rating,
    collaboration_rating performance_rating,
    technical_rating performance_rating,
    leadership_rating performance_rating,
    strengths TEXT[],
    areas_for_improvement TEXT[],
    goals_for_next_period TEXT[],
    comments TEXT,
    metadata JSONB
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_type activity_type NOT NULL,
    user_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Create updated_at triggers for all tables
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('projects', 'team_members', 'tasks', 'notes', 'one_on_one_sessions', 'feedback_entries', 'performance_issues', 'review_packets')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_due ON tasks(assigned_to, due_date);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_status_due ON projects(status, due_date);

CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_manager_id ON team_members(manager_id);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(is_active);

CREATE INDEX IF NOT EXISTS idx_notes_author_id ON notes(author_id);
CREATE INDEX IF NOT EXISTS idx_notes_task_id ON notes(task_id);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_manager_employee ON one_on_one_sessions(manager_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON one_on_one_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON one_on_one_sessions(status);

CREATE INDEX IF NOT EXISTS idx_feedback_giver_receiver ON feedback_entries(giver_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback_entries(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback_entries(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_employee ON performance_issues(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_severity ON performance_issues(severity);
CREATE INDEX IF NOT EXISTS idx_performance_status ON performance_issues(status);
CREATE INDEX IF NOT EXISTS idx_performance_assigned_to ON performance_issues(assigned_to);

CREATE INDEX IF NOT EXISTS idx_reviews_employee_reviewer ON review_packets(employee_id, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_period ON review_packets(review_period_start, review_period_end);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON review_packets(status);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity(created_at);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_notes_search ON notes USING GIN(to_tsvector('english', content));

-- Create partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(status) WHERE status NOT IN ('done', 'completed');
CREATE INDEX IF NOT EXISTS idx_tasks_overdue ON tasks(due_date) WHERE due_date < CURRENT_TIMESTAMP AND status NOT IN ('done', 'completed');
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(status) WHERE status = 'active';

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_on_one_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now, customize based on your auth needs)
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on notes" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all operations on one_on_one_sessions" ON one_on_one_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on feedback_entries" ON feedback_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on performance_issues" ON performance_issues FOR ALL USING (true);
CREATE POLICY "Allow all operations on review_packets" ON review_packets FOR ALL USING (true);
CREATE POLICY "Allow all operations on activity" ON activity FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO team_members (title, color, email, role, department) VALUES
    ('John Doe', '#EF4444', 'john.doe@example.com', 'Senior Developer', 'Engineering'),
    ('Jane Smith', '#8B5CF6', 'jane.smith@example.com', 'Product Manager', 'Product'),
    ('Mike Johnson', '#06B6D4', 'mike.johnson@example.com', 'Designer', 'Design'),
    ('Sarah Wilson', '#10B981', 'sarah.wilson@example.com', 'QA Engineer', 'Engineering')
ON CONFLICT (email) DO NOTHING;

INSERT INTO projects (name, description, color, status, owner_id) VALUES
    ('Website Redesign', 'Complete overhaul of company website', '#3B82F6', 'active', (SELECT id FROM team_members WHERE email = 'jane.smith@example.com' LIMIT 1)),
    ('Mobile App Development', 'Build iOS and Android apps', '#10B981', 'active', (SELECT id FROM team_members WHERE email = 'john.doe@example.com' LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Create a function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    p_activity_type activity_type,
    p_user_id UUID,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    INSERT INTO activity (activity_type, user_id, entity_type, entity_id, description, metadata)
    VALUES (p_activity_type, p_user_id, p_entity_type, p_entity_id, p_description, p_metadata)
    RETURNING id INTO v_activity_id;
    
    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update task counts on projects
CREATE OR REPLACE FUNCTION update_project_task_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE projects 
        SET 
            total_tasks = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id),
            completed_tasks = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND status = 'done'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.project_id;
    END IF;
    
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        UPDATE projects 
        SET 
            total_tasks = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id),
            completed_tasks = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND status = 'done'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.project_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for task count updates
DROP TRIGGER IF EXISTS trigger_update_project_task_counts ON tasks;
CREATE TRIGGER trigger_update_project_task_counts
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_task_counts();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 