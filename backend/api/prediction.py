from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils

router = APIRouter(prefix="/predictions", tags=["ML Predictions"])

@router.get("/success/{idea_id}")
def get_success_prediction(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis details not found for this idea. Run validation first.")
    
    # Confirm owner or admin
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return analysis.success_prediction

@router.get("/investor/{idea_id}")
def get_investor_readiness(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis details not found. Run validation first.")
        
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return analysis.investor_readiness

@router.get("/risk/{idea_id}")
def get_risk_analysis(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis details not found. Run validation first.")
        
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return analysis.risk_analysis

@router.get("/dna/{idea_id}")
def get_dna_analysis(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis details not found. Run validation first.")
        
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return analysis.dna_analysis
