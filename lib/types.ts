export interface Column {
  id: string
  title: string
  type: "uncategorized" | "today" | "delegated" | "future" | "done"
  categories?: string[] // For Today column: ["standing", "big tasks", "comms", "done"]
  people?: string[] // For Delegated column: person names
  tasks: Task[]
}

export interface KanbanBoard {
  columns: Column[]
}

export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  category?: string
  columnId: string // Which column this task belongs to
  personAssigned?: string // For delegated tasks
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
}
