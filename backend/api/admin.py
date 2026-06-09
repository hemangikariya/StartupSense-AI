from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils
from backend.api.auth import UserResponse
from backend.api.ideas import IdeaResponse
from backend.api.support import TicketResponse

router = APIRouter(prefix="/admin", tags=["Admin Control Panel"])

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    details: str | None
    created_at: datetime

    class Config:
        from_attributes = True

class TicketUpdate(BaseModel):
    status: str

class PlatformStatsResponse(BaseModel):
    total_users: int
    total_ideas: int
    total_analyses: int
    total_reports: int
    total_logs: int
    open_tickets: int

@router.get("/stats", response_model=PlatformStatsResponse)
def get_platform_stats(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_utils.get_current_admin)
):
    """
    Returns platform-wide statistics for the admin dashboard.
    """
    return {
        "total_users": db.query(models.User).count(),
        "total_ideas": db.query(models.StartupIdea).count(),
        "total_analyses": db.query(models.Analysis).count(),
        "total_reports": db.query(models.Report).count(),
        "total_logs": db.query(models.ActivityLog).count(),
        "open_tickets": db.query(models.SupportTicket).filter(models.SupportTicket.status == "open").count()
    }

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_utils.get_current_admin)
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()

@router.get("/ideas", response_model=List[IdeaResponse])
def list_ideas(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_utils.get_current_admin)
):
    return db.query(models.StartupIdea).order_by(models.StartupIdea.created_at.desc()).all()

@router.get("/logs", response_model=List[ActivityLogResponse])
def list_activity_logs(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_utils.get_current_admin)
):
    return db.query(models.ActivityLog).order_by(models.ActivityLog.created_at.desc()).limit(100).all()

@router.get("/tickets", response_model=List[TicketResponse])
def list_support_tickets(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_utils.get_current_admin)
):
    return db.query(models.SupportTicket).order_by(models.SupportTicket.created_at.desc()).all()

@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
def update_support_ticket(
    ticket_id: int,
    ticket_in: TicketUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth_utils.get_current_admin)
):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    ticket.status = ticket_in.status
    db.commit()
    db.refresh(ticket)
    
    # Log action
    log = models.ActivityLog(
        user_id=current_admin.id,
        action="update_ticket_status",
        details=f"Admin {current_admin.email} updated ticket ID {ticket_id} status to {ticket_in.status}"
    )
    db.add(log)
    db.commit()

    return ticket
