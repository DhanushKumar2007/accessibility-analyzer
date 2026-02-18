import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import { getProject, analyzeFloorPlan } from '../api/client'
import Canvas from '../features/AnnotationCanvas/Canvas'
import Toolbar from '../features/AnnotationCanvas/Toolbar'
import Dashboard from '../components/Dashboard'
import ReportCard from '../components/ReportCard'
import { ArrowLeft, Download } from 'lucide-react'

const Analysis = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const {
    currentProject,
    setCurrentProject,
    annotations,
    setAnnotations,
    clearAnnotations,
    analysisResult,
    setAnalysisResult,
  } = useProject()

  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedTool, setSelectedTool] = useState(null)

  useEffect(() => {
    // Clear everything when switching projects
    clearAnnotations()
    setAnalysisResult(null)
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      const project = await getProject(projectId)
      setCurrentProject(project)

      // Only restore annotations if this project has been analyzed before
      if (project.annotations && project.annotations.length > 0) {
        setAnnotations(project.annotations)
      } else {
        clearAnnotations()
      }

      if (project.score_data && project.inclusion_score) {
        setAnalysisResult({
          project_id: project.id,
          inclusion_score: project.inclusion_score,
          score_data: project.score_data,
          recommendations: project.score_data.recommendations || [],
        })
      } else {
        setAnalysisResult(null)
      }
    } catch (error) {
      console.error('Error loading project:', error)
      alert('Failed to load project')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (annotations.length === 0) {
      alert('Please add some annotations before analyzing')
      return
    }

    try {
      setAnalyzing(true)

      // Only send current annotations — not stale ones from context
      const annotationsData = annotations.map(ann => ({
        element_type: ann.element_type,
        coordinates: ann.coordinates,
        measurements: ann.measurements,
      }))

      const result = await analyzeFloorPlan(currentProject.id, annotationsData)
      
      // Replace result entirely — never merge with old result
      setAnalysisResult(result)
      alert('Analysis complete!')
    } catch (error) {
      console.error('Error analyzing floor plan:', error)
      alert('Failed to analyze floor plan')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleExportReport = () => {
    if (!analysisResult) {
      alert('Please run analysis first')
      return
    }

    const reportData = {
      project: currentProject,
      analysis: analysisResult,
      annotations: annotations,
      generated_at: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProject.name}_report.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading project...</p>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Project not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{currentProject.name}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {currentProject.standard}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || annotations.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
          <button
            onClick={handleExportReport}
            disabled={!analysisResult}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <Toolbar selectedTool={selectedTool} onToolSelect={setSelectedTool} />
            <div className="mt-4">
              <Canvas
                projectId={currentProject.id}
                imagePath={currentProject.file_path}
                selectedTool={selectedTool}
                onToolComplete={() => setSelectedTool(null)}
              />
            </div>
          </div>

          {analysisResult && (
            <div className="card">
              <ReportCard recommendations={analysisResult.recommendations || []} />
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Dashboard analysisResult={analysisResult} />
        </div>
      </div>
    </div>
  )
}

export default Analysis
