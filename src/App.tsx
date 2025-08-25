import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Sidebar } from './components/Sidebar';
import { TaskBoard } from './components/TaskBoard';
import { ParticleSystem } from './components/ParticleSystem';
import { AmbientLighting } from './components/AmbientLighting';

// Updated App component for Vite deployment
export default function App() {
  const [showParticles, setShowParticles] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const triggerCelebration = () => {
    setShowParticles(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCelebrate={triggerCelebration}
        />
        <TaskBoard />
        
        {/* Particle System for celebrations */}
        {showParticles && (
          <ParticleSystem
            onComplete={() => setShowParticles(false)}
          />
        )}
        
        {/* Ambient Lighting */}
        <AmbientLighting />
      </div>
    </DndProvider>
  );
} 