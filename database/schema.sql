-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE task_status AS ENUM (
  'uncategorized',
  'today', 
  'delegated',
  'later',
  'completed'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'medium', 
  'high'
);

CREATE TYPE feedback_type AS ENUM (
  'positive',
  'constructive',
  'critical'
);

CREATE TYPE performance_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Create tables
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  due_date DATE,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  progress DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  email TEXT,
  role TEXT,
  department TEXT,
  manager_id UUID REFERENCES team_members(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'uncategorized',
  category TEXT,
  priority task_priority DEFAULT 'medium',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS one_on_one_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID REFERENCES team_members(id) NOT NULL,
  employee_id UUID REFERENCES team_members(id) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  agenda TEXT,
  notes TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type feedback_type NOT NULL,
  content TEXT NOT NULL,
  giver_id UUID REFERENCES team_members(id) NOT NULL,
  receiver_id UUID REFERENCES team_members(id) NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  severity performance_severity DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  reported_by UUID REFERENCES team_members(id) NOT NULL,
  assigned_to UUID REFERENCES team_members(id),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  action_plan TEXT,
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_packets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES team_members(id) NOT NULL,
  reviewer_id UUID REFERENCES team_members(id) NOT NULL,
  review_period TEXT NOT NULL,
  review_date DATE NOT NULL,
  technical_rating INTEGER CHECK (technical_rating >= 1 AND technical_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  teamwork_rating INTEGER CHECK (teamwork_rating >= 1 AND teamwork_rating <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  strengths TEXT[],
  areas_for_improvement TEXT[],
  goals TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES team_members(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_person_id ON tasks(person_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);

CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_manager_id ON team_members(manager_id);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON team_members(is_active);

CREATE INDEX IF NOT EXISTS idx_notes_task_id ON notes(task_id);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_team_member_id ON notes(team_member_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_one_on_one_manager_id ON one_on_one_sessions(manager_id);
CREATE INDEX IF NOT EXISTS idx_one_on_one_employee_id ON one_on_one_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_one_on_one_scheduled_at ON one_on_one_sessions(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_feedback_receiver_id ON feedback_entries(receiver_id);
CREATE INDEX IF NOT EXISTS idx_feedback_giver_id ON feedback_entries(giver_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback_entries(type);

CREATE INDEX IF NOT EXISTS idx_performance_issues_assigned_to ON performance_issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_performance_issues_severity ON performance_issues(severity);
CREATE INDEX IF NOT EXISTS idx_performance_issues_status ON performance_issues(status);

CREATE INDEX IF NOT EXISTS idx_review_packets_employee_id ON review_packets(employee_id);
CREATE INDEX IF NOT EXISTS idx_review_packets_reviewer_id ON review_packets(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_packets_review_date ON review_packets(review_date);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity_type ON activity(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity(created_at);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_notes_search ON notes USING GIN(to_tsvector('english', content));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_one_on_one_sessions_updated_at BEFORE UPDATE ON one_on_one_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_entries_updated_at BEFORE UPDATE ON feedback_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_issues_updated_at BEFORE UPDATE ON performance_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_packets_updated_at BEFORE UPDATE ON review_packets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update project task counts
CREATE OR REPLACE FUNCTION update_project_task_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update the project's task counts
        UPDATE projects 
        SET 
            total_tasks = (
                SELECT COUNT(*) FROM tasks 
                WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
            ),
            completed_tasks = (
                SELECT COUNT(*) FROM tasks 
                WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) 
                AND status = 'completed'
            )
        WHERE id = COALESCE(NEW.project_id, OLD.project_id);
        
        -- Update progress percentage
        UPDATE projects 
        SET progress = CASE 
            WHEN total_tasks = 0 THEN 0
            ELSE ROUND((completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100, 2)
        END
        WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        -- Update the project's task counts when a task is deleted
        UPDATE projects 
        SET 
            total_tasks = (
                SELECT COUNT(*) FROM tasks 
                WHERE project_id = OLD.project_id
            ),
            completed_tasks = (
                SELECT COUNT(*) FROM tasks 
                WHERE project_id = OLD.project_id 
                AND status = 'completed'
            )
        WHERE id = OLD.project_id;
        
        -- Update progress percentage
        UPDATE projects 
        SET progress = CASE 
            WHEN total_tasks = 0 THEN 0
            ELSE ROUND((completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100, 2)
        END
        WHERE id = OLD.project_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for project task count updates
CREATE TRIGGER update_project_task_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_project_task_counts();

-- Create function for activity logging
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO activity (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details);
END;
$$ language 'plpgsql';

-- Enable Row Level Security (RLS)
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_on_one_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all operations for now - customize as needed)
CREATE POLICY "Allow all operations on people" ON people FOR ALL USING (true);
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on notes" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all operations on one_on_one_sessions" ON one_on_one_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on feedback_entries" ON feedback_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on performance_issues" ON performance_issues FOR ALL USING (true);
CREATE POLICY "Allow all operations on review_packets" ON review_packets FOR ALL USING (true);
CREATE POLICY "Allow all operations on activity" ON activity FOR ALL USING (true);

-- Insert sample data
INSERT INTO people (name, email, role, department) VALUES
  ('John Smith', 'john.smith@company.com', 'Senior Developer', 'Engineering'),
  ('Sarah Johnson', 'sarah.johnson@company.com', 'Product Manager', 'Product'),
  ('Mike Davis', 'mike.davis@company.com', 'Designer', 'Design')
ON CONFLICT DO NOTHING;

INSERT INTO team_members (title, color, email, role, department) VALUES
  ('John Smith', 'bg-blue-400', 'john.smith@company.com', 'Senior Developer', 'Engineering'),
  ('Sarah Johnson', 'bg-green-400', 'sarah.johnson@company.com', 'Product Manager', 'Product'),
  ('Mike Davis', 'bg-purple-400', 'mike.davis@company.com', 'Designer', 'Design')
ON CONFLICT DO NOTHING;

INSERT INTO projects (name, description, status) VALUES
  ('Website Redesign', 'Complete overhaul of company website', 'active'),
  ('Mobile App', 'New mobile application for customers', 'planning'),
  ('API Integration', 'Integrate third-party services', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, status, category, priority, project_id, person_id) VALUES
  ('Design Homepage', 'Create new homepage design mockups', 'today', 'big-tasks', 'high', 
   (SELECT id FROM projects WHERE name = 'Website Redesign' LIMIT 1),
   (SELECT id FROM people WHERE name = 'Mike Davis' LIMIT 1)),
  ('User Research', 'Conduct user interviews for mobile app', 'today', 'comms', 'medium',
   (SELECT id FROM projects WHERE name = 'Mobile App' LIMIT 1),
   (SELECT id FROM people WHERE name = 'Sarah Johnson' LIMIT 1)),
  ('API Documentation', 'Write API documentation for integration', 'later', 'standing', 'low',
   (SELECT id FROM projects WHERE name = 'API Integration' LIMIT 1),
   (SELECT id FROM people WHERE name = 'John Smith' LIMIT 1))
ON CONFLICT DO NOTHING; 