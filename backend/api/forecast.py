from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils

router = APIRouter(prefix="/forecast", tags=["Forecasting"])

@router.get("/revenue/{idea_id}")
def get_revenue_forecast(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis details not found. Run validation first.")
        
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return analysis.revenue_model

@router.get("/market/{idea_id}")
def get_market_forecast(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis details not found. Run validation first.")
        
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return analysis.market_opportunity
