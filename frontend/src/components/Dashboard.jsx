import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

const Dashboard = ({ analysisResult }) => {
  if (!analysisResult) {
    return (
      <div className="card">
        <p className="text-gray-500 text-center">No analysis data available</p>
      </div>
    )
  }

  const { inclusion_score, score_data } = analysisResult

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const categoryData = Object.entries(score_data.category_scores || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
  }))

  const summaryData = [
    {
      icon: CheckCircle,
      label: 'Compliant Elements',
      value: score_data.compliant_elements || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: AlertCircle,
      label: 'Critical Issues',
      value: score_data.critical_issues || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      icon: AlertTriangle,
      label: 'Warnings',
      value: score_data.warnings || 0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className={`card ${getScoreBgColor(inclusion_score)}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inclusion Score</h2>
          <div className={`text-6xl font-bold ${getScoreColor(inclusion_score)}`}>
            {inclusion_score.toFixed(1)}%
          </div>
          <p className="text-gray-600 mt-2">Overall Accessibility Compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {summaryData.map((item, index) => (
          <div key={index} className={`card ${item.bgColor}`}>
            <div className="flex items-center space-x-3">
              <item.icon className={`h-8 w-8 ${item.color}`} />
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Category Scores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Compliance Distribution</h3>
        <div className="grid grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Compliant', value: score_data.compliant_elements || 0 },
                  { name: 'Non-Compliant', value: (score_data.total_elements || 0) - (score_data.compliant_elements || 0) },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie> {/* Fixed: Added proper closing tag for Pie */}
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="flex flex-col justify-center space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Elements</p>
              <p className="text-3xl font-bold text-gray-900">{score_data.total_elements || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <p className={`text-2xl font-bold ${getScoreColor(inclusion_score)}`}>
                {score_data.total_elements > 0
                  ? ((score_data.compliant_elements / score_data.total_elements) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
