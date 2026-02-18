from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class AnnotationBase(BaseModel):
    element_type: str
    coordinates: Dict[str, Any]
    measurements: Optional[Dict[str, float]] = None

class AnnotationCreate(AnnotationBase):
    project_id: int

class AnnotationResponse(AnnotationBase):
    id: int
    project_id: int
    compliance: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    standard: str = "ADA"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    file_path: str
    file_type: Optional[str]
    created_at: datetime
    updated_at: datetime
    inclusion_score: float
    score_data: Optional[Dict[str, Any]] = None
    annotations: List[AnnotationResponse] = []
    
    class Config:
        from_attributes = True

class AnalysisRequest(BaseModel):
    project_id: int
    annotations: List[AnnotationBase]

class AnalysisResponse(BaseModel):
    project_id: int
    inclusion_score: float
    score_data: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    annotations: List[AnnotationResponse]

class ReportResponse(BaseModel):
    project: ProjectResponse
    recommendations: List[Dict[str, Any]]
