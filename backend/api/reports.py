import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils
from backend.services import pdf_service

router = APIRouter(prefix="/reports", tags=["PDF Reports"])

class ReportResponse(BaseModel):
    id: int
    idea_id: int
    title: str
    pdf_path: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/generate/{idea_id}", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_report(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Generates a PDF analysis report for the specified startup idea.
    """
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    if not analysis:
        raise HTTPException(status_code=400, detail="Idea has not been validated. Run validation first.")

    # PDF Path configuration
    static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "reports")
    os.makedirs(static_dir, exist_ok=True)
    pdf_filename = f"report_{idea_id}_{int(datetime.utcnow().timestamp())}.pdf"
    pdf_path = os.path.join(static_dir, pdf_filename)

    # Call pdf_service
    try:
        pdf_service.generate_startup_pdf(
            output_path=pdf_path,
            title=idea.title,
            summary_data={
                "summary": analysis.summary,
                "problem_statement": analysis.problem_statement,
                "solution": analysis.solution,
                "target_audience": analysis.target_audience
            },
            swot_data=analysis.swot_analysis,
            competitors=analysis.competitor_analysis.get("competitors", []),
            tech_stack=analysis.tech_stack
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

    # Store Report Record
    db_report = models.Report(
        idea_id=idea_id,
        title=f"{idea.title} - Pitch validation report",
        pdf_path=pdf_path
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Log action
    log = models.ActivityLog(
        user_id=current_user.id,
        action="generate_pdf",
        details=f"Generated PDF for idea '{idea.title}' (Report ID: {db_report.id})"
    )
    db.add(log)
    db.commit()

    return db_report

@router.get("/idea/{idea_id}", response_model=List[ReportResponse])
def get_idea_reports(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return db.query(models.Report).filter(models.Report.idea_id == idea_id).order_by(models.Report.created_at.desc()).all()

@router.get("/download/{report_id}")
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report file not found")
        
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == report.idea_id).first()
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    if not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="PDF file missing on server disk")
        
    return FileResponse(
        path=report.pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(report.pdf_path)
    )
