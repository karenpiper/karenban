"use client"

import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { TaskBoard } from "@/components/TaskBoard"

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <TaskBoard />
    </div>
  )
}
