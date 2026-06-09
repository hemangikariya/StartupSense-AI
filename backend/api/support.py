from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils

router = APIRouter(prefix="/support", tags=["Support Tickets"])

class TicketCreate(BaseModel):
    subject: str
    message: str

class TicketResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    db_ticket = models.SupportTicket(
        user_id=current_user.id,
        subject=ticket_in.subject,
        message=ticket_in.message,
        status="open"
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    # Log action
    log = models.ActivityLog(
        user_id=current_user.id,
        action="create_ticket",
        details=f"Created support ticket ID: {db_ticket.id} subject: {db_ticket.subject}"
    )
    db.add(log)
    db.commit()

    return db_ticket

@router.get("/tickets", response_model=List[TicketResponse])
def get_user_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    return db.query(models.SupportTicket)\
        .filter(models.SupportTicket.user_id == current_user.id)\
        .order_by(models.SupportTicket.created_at.desc())\
        .all()

@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return ticket
