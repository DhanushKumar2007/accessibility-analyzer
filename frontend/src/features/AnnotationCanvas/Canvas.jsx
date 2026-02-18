import React, { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect, Line } from 'react-konva'
import { useProject } from '../../context/ProjectContext'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

const calculateDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

const Canvas = ({ projectId, imagePath, selectedTool, onToolComplete }) => {
  const { annotations, addAnnotation } = useProject()
  const [image, setImage] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentShape, setCurrentShape] = useState(null)
  const [measurementModal, setMeasurementModal] = useState(null)
  const stageRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (imagePath) loadImage()
  }, [imagePath])

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setDimensions({ width, height: width * 0.75 })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadImage = () => {
    const filename = imagePath.split(/[\\/]/).pop()
    const url = `http://localhost:8000/uploads/${filename}`
    const ext = filename.split('.').pop().toLowerCase()

    if (ext === 'pdf') {
      loadPDF(url)
    } else {
      loadRegularImage(url)
    }
  }

  const loadRegularImage = (url) => {
    const img = new window.Image()
    img.src = url
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImage(img)
      const scaleX = dimensions.width / img.width
      const scaleY = dimensions.height / img.height
      setScale(Math.min(scaleX, scaleY))
    }
    img.onerror = () => console.error('Failed to load image from:', url)
  }

  const loadPDF = async (url) => {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise
      const page = await pdf.getPage(1)

      const viewport = page.getViewport({ scale: 1 })

      const offscreenCanvas = document.createElement('canvas')
      offscreenCanvas.width = viewport.width
      offscreenCanvas.height = viewport.height
      const ctx = offscreenCanvas.getContext('2d')

      await page.render({ canvasContext: ctx, viewport }).promise

      const img = new window.Image()
      img.src = offscreenCanvas.toDataURL()
      img.onload = () => {
        setImage(img)
        const scaleX = dimensions.width / img.width
        const scaleY = dimensions.height / img.height
        setScale(Math.min(scaleX, scaleY))
      }
    } catch (err) {
      console.error('Failed to load PDF:', err)
    }
  }

  const handleMouseDown = (e) => {
    if (!selectedTool || selectedTool === 'move') return
    const stage = stageRef.current
    const point = stage.getPointerPosition()
    setIsDrawing(true)
    setCurrentShape({
      type: selectedTool,
      startX: point.x,
      startY: point.y,
      endX: point.x,
      endY: point.y,
    })
  }

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentShape) return
    const stage = stageRef.current
    const point = stage.getPointerPosition()
    setCurrentShape({ ...currentShape, endX: point.x, endY: point.y })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape) return
    setIsDrawing(false)

    const distance = calculateDistance(
      currentShape.startX, currentShape.startY,
      currentShape.endX, currentShape.endY
    )

    if (distance < 10) {
      setCurrentShape(null)
      return
    }

    setMeasurementModal({
      shape: currentShape,
      measurements: { width: 0, slope: 0 },
    })
  }

  const handleMeasurementSubmit = () => {
    if (!measurementModal) return
    const { shape, measurements } = measurementModal

    const annotation = {
      id: Date.now(),
      element_type: shape.type,
      coordinates: {
        startX: shape.startX,
        startY: shape.startY,
        endX: shape.endX,
        endY: shape.endY,
      },
      measurements,
    }

    addAnnotation(annotation)
    setMeasurementModal(null)
    setCurrentShape(null)
    onToolComplete()
  }

  const renderShape = (shape, index) => {
    const type = shape.element_type || shape.type
    const color = getShapeColor(type)
    const coords = shape.coordinates || shape

    switch (type) {
      case 'doors':
      case 'lifts':
        return (
          <Rect
            key={index}
            x={Math.min(coords.startX, coords.endX)}
            y={Math.min(coords.startY, coords.endY)}
            width={Math.abs(coords.endX - coords.startX)}
            height={Math.abs(coords.endY - coords.startY)}
            stroke={color}
            strokeWidth={2}
            dash={[5, 5]}
          />
        )
      case 'corridors':
      case 'ramps':
        return (
          <Line
            key={index}
            points={[coords.startX, coords.startY, coords.endX, coords.endY]}
            stroke={color}
            strokeWidth={4}
          />
        )
      default:
        return null
    }
  }

  const getShapeColor = (type) => {
    const colors = { doors: '#3b82f6', corridors: '#10b981', ramps: '#f59e0b', lifts: '#8b5cf6' }
    return colors[type] || '#000000'
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="canvas-container bg-white rounded-lg shadow-inner overflow-hidden border">
        {!image && (
          <div
            className="flex items-center justify-center text-gray-400 text-sm"
            style={{ width: dimensions.width, height: dimensions.height }}
          >
            Loading floor plan...
          </div>
        )}
        {image && (
          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Layer>
              <KonvaImage
                image={image}
                width={image.width * scale}
                height={image.height * scale}
              />
              {annotations.map((ann, index) => renderShape(ann, index))}
              {currentShape && renderShape(currentShape, 'current')}
            </Layer>
          </Stage>
        )}
      </div>

      {measurementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Manual Measurement</h3>
            <div className="space-y-4">
              {measurementModal.shape.type !== 'ramps' ? (
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Width (inches)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    onChange={(e) => setMeasurementModal({
                      ...measurementModal,
                      measurements: { ...measurementModal.measurements, width: parseFloat(e.target.value) }
                    })}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Slope (%)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    onChange={(e) => setMeasurementModal({
                      ...measurementModal,
                      measurements: { ...measurementModal.measurements, slope: parseFloat(e.target.value) }
                    })}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleMeasurementSubmit} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Save</button>
              <button onClick={() => { setMeasurementModal(null); setCurrentShape(null) }} className="flex-1 bg-gray-100 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Canvas
