import React from 'react'
import { Upload } from 'lucide-react'

const FileUploader = ({ onFileSelect }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) onFileSelect(file)
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 cursor-pointer relative transition-all hover:border-blue-400">
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        onChange={handleFileChange}
        accept="image/*,.pdf"
      />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600 font-medium">Click or drag to upload floor plan</p>
      <p className="text-xs text-gray-400">Supports JPG, PNG, PDF</p>
    </div>
  )
}

export default FileUploader
