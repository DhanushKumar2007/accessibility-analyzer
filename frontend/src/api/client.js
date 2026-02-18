import axios from 'axios'

const apiClient = axios.create({
  // Adding /api here ensures every request uses the correct prefix
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
})

export const uploadFloorPlan = async (file, name, standard) => {
  const formData = new FormData()
  formData.append('file', file)
  
  // Note: Your backend expects name and standard as query params
  const response = await apiClient.post(`/upload?name=${encodeURIComponent(name)}&standard=${standard}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getProjects = async () => {
  const response = await apiClient.get('/projects')
  return response.data
}

export const getProject = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}`)
  return response.data
}

export const analyzeFloorPlan = async (projectId, annotations) => {
  const response = await apiClient.post('/analyze', {
    project_id: projectId,
    annotations: annotations,
  })
  return response.data
}

export const deleteProject = async (projectId) => {
  const response = await apiClient.delete(`/projects/${projectId}`)
  return response.data
}

export default apiClient
