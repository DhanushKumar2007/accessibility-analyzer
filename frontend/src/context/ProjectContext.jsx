import React, { createContext, useContext, useState } from 'react'

const ProjectContext = createContext()

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null)
  const [annotations, setAnnotations] = useState([])
  const [analysisResult, setAnalysisResult] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)

  const addAnnotation = (annotation) => {
    setAnnotations(prev => [...prev, annotation])
  }

  const updateAnnotation = (id, updates) => {
    setAnnotations(prev =>
      prev.map(ann => ann.id === id ? { ...ann, ...updates } : ann)
    )
  }

  const deleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id))
  }

  const clearAnnotations = () => {
    setAnnotations([])
  }

  const resetProject = () => {
    setCurrentProject(null)
    setAnnotations([])
    setAnalysisResult(null)
    setUploadedImage(null)
  }

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        setCurrentProject,
        annotations,
        setAnnotations,
        addAnnotation,
        updateAnnotation,
        deleteAnnotation,
        clearAnnotations,
        analysisResult,
        setAnalysisResult,
        uploadedImage,
        setUploadedImage,
        resetProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
