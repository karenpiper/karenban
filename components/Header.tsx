"use client"

import { Search, Filter, Calendar, ToggleLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="bg-white p-4 mb-4">
      <div className="space-y-3">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Task Board</h1>
          <p className="text-sm text-gray-600">Focus on now and later.</p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks, descriptions, or tags..."
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm px-3 py-1 h-8"
          >
            <Filter className="w-3 h-3 mr-1" />
            All Priority
          </Button>
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm px-3 py-1 h-8"
          >
            <Calendar className="w-3 h-3 mr-1" />
            All Assignees
          </Button>
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm px-3 py-1 h-8"
          >
            This Week
          </Button>

          {/* Auto-move Toggle */}
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm px-3 py-1 h-8"
          >
            <ToggleLeft className="w-3 h-3 mr-1" />
            Auto-move completed
          </Button>
        </div>
      </div>
    </header>
  )
}

