"use client"

import { useState } from 'react'
import { useKanbanStore } from '@/lib/store'
import { X, User, Palette, Plus } from 'lucide-react'

interface AddPersonFormProps {
  isOpen: boolean
  onClose: () => void
}

export function AddPersonForm({ isOpen, onClose }: AddPersonFormProps) {
  const { addPerson } = useKanbanStore()
  
  const [formData, setFormData] = useState({
    name: '',
    color: '#ef4444'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const predefinedColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#f43f5e', '#14b8a6', '#0ea5e9', '#7c3aed', '#be185d', '#f97316'
  ]
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    addPerson({
      name: formData.name.trim(),
      color: formData.color
    })
    
    // Reset form
    setFormData({
      name: '',
      color: '#ef4444'
    })
    setErrors({})
    onClose()
  }
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Person to Follow-up</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Person Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter person's name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Palette className="w-4 h-4 inline mr-2" />
              Profile Color
            </label>
            <div className="grid grid-cols-6 gap-3">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    formData.color === color 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {formData.color === color && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              This color will be used to identify the person in the follow-up column
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Person
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 