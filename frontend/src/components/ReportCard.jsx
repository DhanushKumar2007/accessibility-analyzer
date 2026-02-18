import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const ReportCard = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-500 text-center">No recommendations available</p>
      </div>
    )
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-6 w-6 text-red-600" />
      case 'medium':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      case 'low':
        return <Info className="h-6 w-6 text-blue-600" />
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      case 'low':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
      
      {sortedRecommendations.map((rec, index) => (
        <div
          key={index}
          className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
        >
          <div className="flex items-start space-x-3">
            {getPriorityIcon(rec.priority)}
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityBadge(rec.priority)}`}>
                  {rec.priority.toUpperCase()}
                </span>
                {rec.category && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700">
                    {rec.category.toUpperCase()}
                  </span>
                )}
              </div>
              
              <p className="text-gray-900 font-medium mb-1">{rec.message}</p>
              
              {rec.suggestion && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold">Suggestion:</span> {rec.suggestion}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReportCard
