from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils
from backend.services import ai_service

router = APIRouter(prefix="/mentor", tags=["AI Startup Mentor"])

# Pydantic Schemas
class ChatMessageIn(BaseModel):
    message: str

class ChatRenameIn(BaseModel):
    title: str

class ChatExportIn(BaseModel):
    chat_id: str

class ChatMessageResponse(BaseModel):
    id: int
    idea_id: int
    user_id: int
    message: str
    response: str
    question: str
    answer: str
    chat_id: Optional[str] = None
    chat_title: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    chat_id: str
    chat_title: str
    created_at: datetime
    idea_id: int

@router.get("/history", response_model=List[ChatSessionResponse])
def get_chat_sessions(
    idea_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Get all unique chat sessions for the user, optionally filtered by idea_id.
    """
    query = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == current_user.id)
    if idea_id is not None:
        query = query.filter(models.ChatHistory.idea_id == idea_id)
        
    all_messages = query.order_by(models.ChatHistory.created_at.desc()).all()
    
    seen_chats = {}
    for msg in all_messages:
        cid = msg.chat_id or f"migrated_{msg.idea_id}"
        if cid not in seen_chats:
            seen_chats[cid] = {
                "chat_id": cid,
                "chat_title": msg.chat_title or "Untitled Chat",
                "created_at": msg.created_at,
                "idea_id": msg.idea_id
            }
    return list(seen_chats.values())

@router.get("/history/{chat_id}", response_model=List[ChatMessageResponse])
def get_chat_messages(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Retrieves all messages for a specific chat session.
    """
    messages = db.query(models.ChatHistory)\
        .filter(models.ChatHistory.chat_id == chat_id)\
        .order_by(models.ChatHistory.created_at.asc())\
        .all()
        
    if messages:
        first_msg = messages[0]
        idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == first_msg.idea_id).first()
        if not idea or (idea.user_id != current_user.id and current_user.role != "admin"):
            raise HTTPException(status_code=403, detail="Not authorized to access this chat history")
            
    return [
        {
            "id": msg.id,
            "idea_id": msg.idea_id,
            "user_id": msg.user_id,
            "message": msg.message,
            "response": msg.response,
            "question": msg.message,
            "answer": msg.response,
            "chat_id": msg.chat_id,
            "chat_title": msg.chat_title,
            "created_at": msg.created_at
        }
        for msg in messages
    ]

@router.put("/history/{chat_id}/rename")
def rename_chat_session(
    chat_id: str,
    data: ChatRenameIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Renames the title of a specific chat session.
    """
    db.query(models.ChatHistory)\
        .filter(models.ChatHistory.chat_id == chat_id)\
        .update({models.ChatHistory.chat_title: data.title})
    db.commit()
    return {"status": "success", "chat_id": chat_id, "new_title": data.title}

@router.delete("/history/{chat_id}")
def delete_chat_session(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Deletes all messages of a specific chat session.
    """
    db.query(models.ChatHistory).filter(models.ChatHistory.chat_id == chat_id).delete()
    db.commit()
    return {"status": "success", "message": f"Chat session {chat_id} deleted."}

@router.post("/history/export")
def export_chat_session(
    data: ChatExportIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Exports a chat session transcript as text.
    """
    messages = db.query(models.ChatHistory)\
        .filter(models.ChatHistory.chat_id == data.chat_id)\
        .order_by(models.ChatHistory.created_at.asc())\
        .all()
    if not messages:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    transcript = f"Startup Mentor Chat Transcript - {messages[0].chat_title or 'Untitled Chat'}\n"
    transcript += f"Exported on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC\n"
    transcript += "="*60 + "\n\n"
    for msg in messages:
        ts = msg.created_at.strftime('%Y-%m-%d %H:%M:%S')
        transcript += f"[{ts}] User: {msg.message}\n"
        transcript += f"[{ts}] AI Mentor: {msg.response}\n"
        transcript += "-"*40 + "\n\n"
        
    return {"content": transcript}

@router.post("/chat/ask/{idea_id}", response_model=ChatMessageResponse)
def send_mentor_message_ask(
    idea_id: int,
    question: str = Query(...),
    chat_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Submits a message to the AI Startup Mentor, context aware of idea analysis and history.
    """
    # 1. Verify idea
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this idea")

    # 2. Retrieve startup analysis context for Gemini prompt
    analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    analysis_summary = analysis.summary if analysis else None
    swot = analysis.swot_analysis if analysis else None
    competitors = analysis.competitor_analysis if analysis else None
    revenue_model = analysis.revenue_model if analysis else None

    # 3. Handle session ID and title
    if not chat_id:
        chat_id = f"chat_{uuid.uuid4().hex[:12]}"
        chat_title = question[:40] + ("..." if len(question) > 40 else "")
    else:
        existing_msg = db.query(models.ChatHistory).filter(models.ChatHistory.chat_id == chat_id).first()
        if existing_msg:
            chat_title = existing_msg.chat_title
        else:
            chat_title = question[:40] + ("..." if len(question) > 40 else "")

    # 4. Get past chat history in this session
    history_records = db.query(models.ChatHistory)\
        .filter(models.ChatHistory.chat_id == chat_id)\
        .order_by(models.ChatHistory.created_at.asc())\
        .all()
        
    chat_history_list = [
        {"message": record.message, "response": record.response}
        for record in history_records
    ]

    # 5. Request response from AI service
    ai_response = ai_service.mentor_chat(
        idea_title=idea.title,
        idea_desc=idea.description,
        chat_history=chat_history_list,
        user_message=question,
        analysis_summary=analysis_summary,
        swot=swot,
        competitors=competitors,
        revenue_model=revenue_model
    )

    # 6. Save to Database
    db_chat = models.ChatHistory(
        idea_id=idea_id,
        user_id=current_user.id,
        message=question,
        response=ai_response,
        chat_id=chat_id,
        chat_title=chat_title
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)

    return {
        "id": db_chat.id,
        "idea_id": db_chat.idea_id,
        "user_id": db_chat.user_id,
        "message": db_chat.message,
        "response": db_chat.response,
        "question": db_chat.message,
        "answer": db_chat.response,
        "chat_id": db_chat.chat_id,
        "chat_title": db_chat.chat_title,
        "created_at": db_chat.created_at
    }

@router.post("/chat/{idea_id}", response_model=ChatMessageResponse)
def send_mentor_message(
    idea_id: int,
    msg_in: ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Submits a message to the AI Startup Mentor (legacy format).
    """
    chat_id = f"migrated_{idea_id}"
    return send_mentor_message_ask(
        idea_id=idea_id,
        question=msg_in.message,
        chat_id=chat_id,
        db=db,
        current_user=current_user
    )

@router.get("/chat/{idea_id}", response_model=List[ChatMessageResponse])
def get_mentor_chat_history(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    """
    Retrieves previous message transcripts (legacy format).
    """
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this idea")
        
    messages = db.query(models.ChatHistory)\
        .filter(models.ChatHistory.idea_id == idea_id)\
        .order_by(models.ChatHistory.created_at.asc())\
        .all()
    return [
        {
            "id": msg.id,
            "idea_id": msg.idea_id,
            "user_id": msg.user_id,
            "message": msg.message,
            "response": msg.response,
            "question": msg.message,
            "answer": msg.response,
            "chat_id": msg.chat_id,
            "chat_title": msg.chat_title,
            "created_at": msg.created_at
        }
        for msg in messages
    ]
