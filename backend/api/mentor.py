from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils
from backend.services import ai_service

router = APIRouter(prefix="/mentor", tags=["AI Startup Mentor"])

# Pydantic Schemas
class ChatMessageIn(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    idea_id: int
    user_id: int
    message: str
    response: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/chat/{idea_id}", response_model=ChatMessageResponse)
def send_mentor_message(
    idea_id: int,
    msg_in: ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Submits a message to the AI Startup Mentor.
    The response is context-aware based on the startup's idea description and history.
    """
    # 1. Verify idea
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this idea")

    # 2. Get past chat history
    history_records = db.query(models.ChatHistory)\
        .filter(models.ChatHistory.idea_id == idea_id)\
        .order_by(models.ChatHistory.created_at.asc())\
        .all()
        
    chat_history_list = [
        {"message": record.message, "response": record.response}
        for record in history_records
    ]

    # 3. Request response from AI service
    ai_response = ai_service.mentor_chat(
        idea_title=idea.title,
        idea_desc=idea.description,
        chat_history=chat_history_list,
        user_message=msg_in.message
    )

    # 4. Save to Database
    db_chat = models.ChatHistory(
        idea_id=idea_id,
        user_id=current_user.id,
        message=msg_in.message,
        response=ai_response
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)

    return db_chat

@router.get("/chat/{idea_id}", response_model=List[ChatMessageResponse])
def get_mentor_chat_history(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Retrieves previous message transcripts.
    """
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this idea")
        
    return db.query(models.ChatHistory)\
        .filter(models.ChatHistory.idea_id == idea_id)\
        .order_by(models.ChatHistory.created_at.asc())\
        .all()
