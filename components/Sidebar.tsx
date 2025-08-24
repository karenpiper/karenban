"use client"

import { BarChart3, Target, Trophy, Clock, Zap, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function Sidebar() {
  return (
    <aside className="w-72 glass-panel m-4 mr-2 rounded-2xl p-4 transition-all duration-200 glass-panel-hover flex-shrink-0">
      {/* Navigation */}
      <nav className="space-y-2 mb-6">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <BarChart3 className="w-5 h-5 mr-3" />
          Dashboard
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <Target className="w-5 h-5 mr-3" />
          Goals
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <Trophy className="w-5 h-5 mr-3" />
          Achievements
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <Calendar className="w-5 h-5 mr-3" />
          Calendar
        </Button>
      </nav>

      {/* Quick Stats */}
      <div className="space-y-4">
        <div>
          <h3 className="text-white/90 font-medium mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Today's Progress
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Tasks Completed</span>
                <span className="text-white/90">8/12</span>
              </div>
              <Progress value={67} className="h-2 bg-white/10" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Focus Time</span>
                <span className="text-white/90">4.2h</span>
              </div>
              <Progress value={84} className="h-2 bg-white/10" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-white/90 font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Streaks
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">7</div>
              <div className="text-xs text-white/70">Day Streak</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">23</div>
              <div className="text-xs text-white/70">Best Streak</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-white/90 font-medium mb-3">Recent Achievements</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm text-white/90">Task Crusher</div>
                <div className="text-xs text-white/60">Completed 100 tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
