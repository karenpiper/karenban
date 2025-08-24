export type TaskStatus = 
  | 'todo' 
  | 'in_progress' 
  | 'blocked' 
  | 'done' 
  | 'delegated'
  | 'monday' 
  | 'tuesday' 
  | 'wednesday' 
  | 'thursday' 
  | 'friday' 
  | 'saturday' 
  | 'sunday';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';

export type FeedbackType = 'positive' | 'constructive' | 'critical';

export type PerformanceRating = 'exceeds' | 'meets' | 'below' | 'needs_improvement';

export type ActivityType = 
  | 'task_created' 
  | 'task_completed' 
  | 'task_delegated' 
  | 'note_added' 
  | 'feedback_given' 
  | 'session_scheduled';

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string;
          status: ProjectStatus;
          created_at: string;
          updated_at: string | null;
          due_date: string | null;
          progress: number;
          total_tasks: number;
          completed_tasks: number;
          owner_id: string | null;
          team_members: string[] | null;
          tags: string[] | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color?: string;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string | null;
          due_date?: string | null;
          progress?: number;
          total_tasks?: number;
          completed_tasks?: number;
          owner_id?: string | null;
          team_members?: string[] | null;
          tags?: string[] | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string | null;
          due_date?: string | null;
          progress?: number;
          total_tasks?: number;
          completed_tasks?: number;
          owner_id?: string | null;
          team_members?: string[] | null;
          tags?: string[] | null;
          metadata?: any | null;
        };
      };
      team_members: {
        Row: {
          id: string;
          title: string;
          color: string;
          email: string | null;
          role: string | null;
          department: string | null;
          manager_id: string | null;
          created_at: string;
          updated_at: string | null;
          is_active: boolean;
          avatar_url: string | null;
          phone: string | null;
          location: string | null;
          timezone: string | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          title: string;
          color?: string;
          email?: string | null;
          role?: string | null;
          department?: string | null;
          manager_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_active?: boolean;
          avatar_url?: string | null;
          phone?: string | null;
          location?: string | null;
          timezone?: string | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          title?: string;
          color?: string;
          email?: string | null;
          role?: string | null;
          department?: string | null;
          manager_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_active?: boolean;
          avatar_url?: string | null;
          phone?: string | null;
          location?: string | null;
          timezone?: string | null;
          metadata?: any | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          category: string | null;
          priority: TaskPriority;
          project_id: string | null;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string | null;
          completed_at: string | null;
          due_date: string | null;
          estimated_hours: number | null;
          actual_hours: number | null;
          tags: string[] | null;
          notes: string | null;
          dependencies: string[] | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          category?: string | null;
          priority?: TaskPriority;
          project_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string | null;
          completed_at?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          tags?: string[] | null;
          notes?: string | null;
          dependencies?: string[] | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          category?: string | null;
          priority?: TaskPriority;
          project_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string | null;
          completed_at?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          tags?: string[] | null;
          notes?: string | null;
          dependencies?: string[] | null;
          metadata?: any | null;
        };
      };
      notes: {
        Row: {
          id: string;
          content: string;
          author_id: string;
          task_id: string | null;
          project_id: string | null;
          team_member_id: string | null;
          created_at: string;
          updated_at: string | null;
          is_private: boolean;
          tags: string[] | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          content: string;
          author_id: string;
          task_id?: string | null;
          project_id?: string | null;
          team_member_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_private?: boolean;
          tags?: string[] | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          content?: string;
          author_id?: string;
          task_id?: string | null;
          project_id?: string | null;
          team_member_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_private?: boolean;
          tags?: string[] | null;
          metadata?: any | null;
        };
      };
      one_on_one_sessions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          manager_id: string;
          employee_id: string;
          scheduled_at: string;
          duration_minutes: number;
          status: string;
          created_at: string;
          updated_at: string | null;
          completed_at: string | null;
          location: string | null;
          meeting_url: string | null;
          agenda: string[] | null;
          notes: string | null;
          follow_up_required: boolean;
          follow_up_date: string | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          manager_id: string;
          employee_id: string;
          scheduled_at: string;
          duration_minutes?: number;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          completed_at?: string | null;
          location?: string | null;
          meeting_url?: string | null;
          agenda?: string[] | null;
          notes?: string | null;
          follow_up_required?: boolean;
          follow_up_date?: string | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          manager_id?: string;
          employee_id?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          completed_at?: string | null;
          location?: string | null;
          meeting_url?: string | null;
          agenda?: string[] | null;
          notes?: string | null;
          follow_up_required?: boolean;
          follow_up_date?: string | null;
          metadata?: any | null;
        };
      };
      feedback_entries: {
        Row: {
          id: string;
          title: string;
          content: string;
          feedback_type: FeedbackType;
          giver_id: string;
          receiver_id: string;
          task_id: string | null;
          project_id: string | null;
          session_id: string | null;
          created_at: string;
          updated_at: string | null;
          is_anonymous: boolean;
          is_public: boolean;
          tags: string[] | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          feedback_type: FeedbackType;
          giver_id: string;
          receiver_id: string;
          task_id?: string | null;
          project_id?: string | null;
          session_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_anonymous?: boolean;
          is_public?: boolean;
          tags?: string[] | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          feedback_type?: FeedbackType;
          giver_id?: string;
          receiver_id?: string;
          task_id?: string | null;
          project_id?: string | null;
          session_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_anonymous?: boolean;
          is_public?: boolean;
          tags?: string[] | null;
          metadata?: any | null;
        };
      };
      performance_issues: {
        Row: {
          id: string;
          title: string;
          description: string;
          employee_id: string;
          reported_by: string;
          severity: string;
          status: string;
          created_at: string;
          updated_at: string | null;
          resolved_at: string | null;
          due_date: string | null;
          assigned_to: string | null;
          action_plan: string | null;
          follow_up_date: string | null;
          tags: string[] | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          employee_id: string;
          reported_by: string;
          severity?: string;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          resolved_at?: string | null;
          due_date?: string | null;
          assigned_to?: string | null;
          action_plan?: string | null;
          follow_up_date?: string | null;
          tags?: string[] | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          employee_id?: string;
          reported_by?: string;
          severity?: string;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          resolved_at?: string | null;
          due_date?: string | null;
          assigned_to?: string | null;
          action_plan?: string | null;
          follow_up_date?: string | null;
          tags?: string[] | null;
          metadata?: any | null;
        };
      };
      review_packets: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          employee_id: string;
          reviewer_id: string;
          review_period_start: string;
          review_period_end: string;
          status: string;
          created_at: string;
          updated_at: string | null;
          submitted_at: string | null;
          completed_at: string | null;
          overall_rating: PerformanceRating | null;
          goals_rating: PerformanceRating | null;
          collaboration_rating: PerformanceRating | null;
          technical_rating: PerformanceRating | null;
          leadership_rating: PerformanceRating | null;
          strengths: string[] | null;
          areas_for_improvement: string[] | null;
          goals_for_next_period: string[] | null;
          comments: string | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          employee_id: string;
          reviewer_id: string;
          review_period_start: string;
          review_period_end: string;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          submitted_at?: string | null;
          completed_at?: string | null;
          overall_rating?: PerformanceRating | null;
          goals_rating?: PerformanceRating | null;
          collaboration_rating?: PerformanceRating | null;
          technical_rating?: PerformanceRating | null;
          leadership_rating?: PerformanceRating | null;
          strengths?: string[] | null;
          areas_for_improvement?: string[] | null;
          goals_for_next_period?: string[] | null;
          comments?: string | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          employee_id?: string;
          reviewer_id?: string;
          review_period_start?: string;
          review_period_end?: string;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          submitted_at?: string | null;
          completed_at?: string | null;
          overall_rating?: PerformanceRating | null;
          goals_rating?: PerformanceRating | null;
          collaboration_rating?: PerformanceRating | null;
          technical_rating?: PerformanceRating | null;
          leadership_rating?: PerformanceRating | null;
          strengths?: string[] | null;
          areas_for_improvement?: string[] | null;
          goals_for_next_period?: string[] | null;
          comments?: string | null;
          metadata?: any | null;
        };
      };
      activity: {
        Row: {
          id: string;
          activity_type: ActivityType;
          user_id: string;
          entity_type: string;
          entity_id: string;
          description: string | null;
          metadata: any | null;
          created_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          activity_type: ActivityType;
          user_id: string;
          entity_type: string;
          entity_id: string;
          description?: string | null;
          metadata?: any | null;
          created_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          activity_type?: ActivityType;
          user_id?: string;
          entity_type?: string;
          entity_id?: string;
          description?: string | null;
          metadata?: any | null;
          created_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      log_activity: {
        Args: {
          p_activity_type: ActivityType;
          p_user_id: string;
          p_entity_type: string;
          p_entity_id: string;
          p_description?: string;
          p_metadata?: any;
        };
        Returns: string;
      };
      update_project_task_counts: {
        Args: Record<string, never>;
        Returns: any;
      };
      update_updated_at_column: {
        Args: Record<string, never>;
        Returns: any;
      };
    };
    Enums: {
      task_status: TaskStatus;
      task_priority: TaskPriority;
      project_status: ProjectStatus;
      feedback_type: FeedbackType;
      performance_rating: PerformanceRating;
      activity_type: ActivityType;
    };
  };
} 