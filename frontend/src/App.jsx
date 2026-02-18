import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ProjectProvider } from './context/ProjectContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Analysis from './pages/Analysis'

function App() {
  return (
    <Router>
      <ProjectProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis/:projectId" element={<Analysis />} />
          </Routes>
        </div>
      </ProjectProvider>
    </Router>
  )
}

export default App
