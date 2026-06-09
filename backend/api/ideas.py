from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils

router = APIRouter(prefix="/ideas", tags=["Startup Ideas"])

# Pydantic Schemas
class IdeaCreate(BaseModel):
    title: str
    description: str
    industry: str | None = None
    category: str | None = None
    subcategory: str | None = None
    business_model: str | None = None

class IdeaResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    industry: str | None
    category: str | None
    subcategory: str | None
    business_model: str | None
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("", response_model=IdeaResponse, status_code=status.HTTP_201_CREATED)
def create_idea(idea_in: IdeaCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    db_idea = models.StartupIdea(
        user_id=current_user.id,
        title=idea_in.title,
        description=idea_in.description,
        industry=idea_in.industry,
        category=idea_in.category,
        subcategory=idea_in.subcategory,
        business_model=idea_in.business_model
    )
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)

    # Log action
    log = models.ActivityLog(
        user_id=current_user.id,
        action="create_idea",
        details=f"Created startup idea '{db_idea.title}' (ID: {db_idea.id})"
    )
    db.add(log)
    db.commit()

    return db_idea

@router.get("", response_model=List[IdeaResponse])
def get_user_ideas(db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    return db.query(models.StartupIdea).filter(models.StartupIdea.user_id == current_user.id).order_by(models.StartupIdea.created_at.desc()).all()

@router.get("/{idea_id}", response_model=IdeaResponse)
def get_idea(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this idea")
    return idea

@router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_idea(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this idea")
    
    db.delete(idea)
    db.commit()

    # Log action
    log = models.ActivityLog(
        user_id=current_user.id,
        action="delete_idea",
        details=f"Deleted startup idea ID: {idea_id}"
    )
    db.add(log)
    db.commit()
    
    return None
