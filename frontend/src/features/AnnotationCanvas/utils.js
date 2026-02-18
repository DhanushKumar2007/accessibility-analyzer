export const pixelToMeter = (pixels, scale = 0.01) => {
  return pixels * scale
}

export const meterToPixel = (meters, scale = 0.01) => {
  return meters / scale
}

export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

export const calculateSlope = (x1, y1, x2, y2, rise) => {
  const run = calculateDistance(x1, y1, x2, y2)
  return run > 0 ? (rise / run) * 100 : 0
}

export const formatMeasurement = (value, unit = 'm') => {
  return `${value.toFixed(2)} ${unit}`
}

export const getElementColor = (elementType, compliance) => {
  if (!compliance) return '#9ca3af'
  
  if (compliance.compliant) {
    return compliance.severity === 'warning' ? '#f59e0b' : '#10b981'
  }
  
  return '#ef4444'
}

export const calculateArea = (x1, y1, x2, y2) => {
  const width = Math.abs(x2 - x1)
  const height = Math.abs(y2 - y1)
  return width * height
}

export const getShapeCenter = (x1, y1, x2, y2) => {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  }
}
