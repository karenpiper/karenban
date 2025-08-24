"use client"

import { Search, Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="glass-panel rounded-2xl p-4 mb-6 transition-all duration-200 glass-panel-hover">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm opacity-90" />
          </div>
          <h1 className="text-xl font-semibold text-white">KarenBan</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Avatar className="w-8 h-8 border-2 border-white/30">
            <AvatarImage src="/diverse-user-avatars.png" />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-500 text-white text-sm">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
