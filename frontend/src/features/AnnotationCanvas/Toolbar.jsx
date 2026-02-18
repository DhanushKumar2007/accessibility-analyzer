import React from 'react'
// Changed Elevator to ArrowUpCircle
import { DoorClosed, Minus, TrendingUp, ArrowUpCircle, Move } from 'lucide-react'

const Toolbar = ({ selectedTool, onToolSelect }) => {
  const tools = [
    { id: 'doors', label: 'Door', icon: DoorClosed },
    { id: 'corridors', label: 'Corridor', icon: Minus },
    { id: 'ramps', label: 'Ramp', icon: TrendingUp },
    { id: 'lifts', label: 'Lift', icon: ArrowUpCircle }, // Corrected icon name
    { id: 'move', label: 'Move', icon: Move },
  ]

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b rounded-t-lg">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id === selectedTool ? null : tool.id)}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedTool === tool.id 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-gray-600 border hover:bg-gray-100'
          }`}
        >
          <tool.icon className="h-4 w-4 mr-2" />
          {tool.label}
        </button>
      ))}
    </div>
  )
}

export default Toolbar
