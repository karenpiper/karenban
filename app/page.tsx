"use client"

import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { TaskBoard } from "@/components/TaskBoard"

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-gray-50/60">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <TaskBoard />
    </div>
  )
}
