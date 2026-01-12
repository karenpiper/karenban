"use client"

import { useState } from "react"
import { RoleGoalsView } from "./RoleGoalsView"
import type { RoleGrowthGoal } from "../types"

interface SettingsViewProps {
  roleGoals: RoleGrowthGoal[]
  onUpdateRoleGoals: (goals: RoleGrowthGoal[]) => void
}

export function SettingsView({ roleGoals, onUpdateRoleGoals }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"role-goals" | "general">("role-goals")

  return (
    <div className="flex-1 overflow-auto bg-mgmt-beige min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-heading text-gray-800 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm p-6">
          <div className="flex gap-2 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("role-goals")}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "role-goals"
                  ? "border-mgmt-green text-mgmt-green"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Role Goals
            </button>
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "general"
                  ? "border-mgmt-green text-mgmt-green"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              General
            </button>
          </div>

          {/* Role Goals Tab */}
          {activeTab === "role-goals" && (
            <div>
              <RoleGoalsView
                roleGoals={roleGoals}
                onUpdate={onUpdateRoleGoals}
              />
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">General settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

