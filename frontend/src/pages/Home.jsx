import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FileUploader from '../components/FileUploader'
import { uploadFloorPlan, getProjects, deleteProject } from '../api/client'
import { useProject } from '../context/ProjectContext'
import { Trash2, Eye, FolderOpen } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()
  const { setCurrentProject, setUploadedImage, resetProject } = useProject()
  const [selectedFile, setSelectedFile] = useState(null)
  const [projectName, setProjectName] = useState('')
  const [standard, setStandard] = useState('ADA')
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    if (!projectName) {
      setProjectName(file.name.split('.')[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !projectName) {
      alert('Please select a file and enter a project name')
      return
    }

    try {
      setLoading(true)
      const project = await uploadFloorPlan(selectedFile, projectName, standard)
      
      const imageUrl = URL.createObjectURL(selectedFile)
      setUploadedImage(imageUrl)
      setCurrentProject(project)
      
      navigate(`/analysis/${project.id}`)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewProject = (project) => {
    setCurrentProject(project)
    navigate(`/analysis/${project.id}`)
  }

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation()
    
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      await deleteProject(projectId)
      loadProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Campus Accessibility Analyzer
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your architectural floor plans and analyze accessibility compliance
          based on ADA and Indian accessibility standards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">New Project</h2>
          
          <div className="space-y-6">
            <FileUploader onFileSelect={handleFileSelect} />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accessibility Standard
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ADA">ADA (American)</option>
                <option value="INDIAN">Indian Standards</option>
              </select>
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || !projectName || loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Start Analysis'}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Projects</h2>
          
          {loadingProjects ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleViewProject(project)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        Score: {project.inclusion_score.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500">
                        {project.standard}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewProject(project)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
