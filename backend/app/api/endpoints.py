from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
from datetime import datetime

from app.api.dependencies import get_db, init_db
from app.models.sql_models import Project, Annotation
from app.schemas.schemas import (
    ProjectCreate, ProjectResponse, AnnotationCreate, AnnotationResponse,
    AnalysisRequest, AnalysisResponse, ReportResponse
)
from app.core.config import settings
from app.core.rules import AccessibilityRules
from app.core.scoring import InclusionScoreCalculator
from app.services.file_storage import FileStorage

router = APIRouter()

init_db()

@router.post("/upload", response_model=ProjectResponse)
async def upload_floor_plan(
    file: UploadFile = File(...),
    name: str = "Untitled Project",
    standard: str = "ADA",
    db: Session = Depends(get_db)
):
    if file.size is not None and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds limit")
    
    allowed_extensions = [".png", ".jpg", ".jpeg", ".pdf"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    file_path = await FileStorage.save_file(file)
    
    project = Project(
        name=name,
        file_path=file_path,
        file_type=file_ext,
        standard=standard
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return project


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_floor_plan(
    request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == request.project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.query(Annotation).filter(Annotation.project_id == request.project_id).delete()
    
    processed_annotations = []
    
    for ann in request.annotations:
        compliance_result = None
        
        if ann.element_type == "doors" and ann.measurements:
            compliance_result = AccessibilityRules.check_door_compliance(
                ann.measurements.get("width", 0), project.standard
            )
        elif ann.element_type == "corridors" and ann.measurements:
            compliance_result = AccessibilityRules.check_corridor_compliance(
                ann.measurements.get("width", 0), project.standard
            )
        elif ann.element_type == "ramps" and ann.measurements:
            compliance_result = AccessibilityRules.check_ramp_compliance(
                ann.measurements.get("slope", 0), project.standard
            )
        elif ann.element_type == "lifts" and ann.measurements:
            compliance_result = AccessibilityRules.check_lift_compliance(
                ann.measurements.get("width", 0), project.standard
            )
        
        annotation = Annotation(
            project_id=request.project_id,
            element_type=ann.element_type,
            coordinates=ann.coordinates,
            measurements=ann.measurements,
            compliance=compliance_result
        )
        
        db.add(annotation)
        db.flush()
        
        processed_annotations.append({
            "id": annotation.id,
            "element_type": annotation.element_type,
            "compliance": compliance_result
        })
    
    score_data = InclusionScoreCalculator.calculate_score(processed_annotations, project.standard)
    recommendations = InclusionScoreCalculator.generate_recommendations(processed_annotations, score_data)
    
    project.inclusion_score = score_data["overall_score"]
    project.score_data = score_data
    project.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(project)
    
    annotations_response = db.query(Annotation).filter(Annotation.project_id == request.project_id).all()
    
    return AnalysisResponse(
        project_id=project.id,
        inclusion_score=project.inclusion_score,
        score_data=score_data,
        recommendations=recommendations,
        annotations=annotations_response
    )


@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return projects


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project


@router.get("/report/{project_id}", response_model=ReportResponse)
async def get_report(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    annotations = db.query(Annotation).filter(Annotation.project_id == project_id).all()
    
    processed_annotations = []
    for ann in annotations:
        processed_annotations.append({
            "id": ann.id,
            "element_type": ann.element_type,
            "compliance": ann.compliance
        })
    
    score_data = project.score_data or {}
    recommendations = InclusionScoreCalculator.generate_recommendations(processed_annotations, score_data)
    
    return ReportResponse(
        project=project,
        recommendations=recommendations
    )


@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if os.path.exists(project.file_path):
        os.remove(project.file_path)
    
    db.delete(project)
    db.commit()
    
    return {"message": "Project deleted successfully"}
