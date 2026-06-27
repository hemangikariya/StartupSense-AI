import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="user")  # "user" or "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    ideas = relationship("StartupIdea", back_populates="owner", cascade="all, delete-orphan")
    tickets = relationship("SupportTicket", back_populates="user", cascade="all, delete-orphan")
    logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")

class StartupIdea(Base):
    __tablename__ = "startup_ideas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    industry = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    subcategory = Column(String(100), nullable=True)
    business_model = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="ideas")
    analyses = relationship("Analysis", back_populates="idea", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="idea", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="idea", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("startup_ideas.id", ondelete="CASCADE"), nullable=False)
    
    # Textual Summaries
    summary = Column(Text, nullable=True)
    problem_statement = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    target_audience = Column(Text, nullable=True)
    
    # JSON analysis objects
    swot_analysis = Column(JSON, nullable=True)
    competitor_analysis = Column(JSON, nullable=True)
    market_opportunity = Column(JSON, nullable=True)
    revenue_model = Column(JSON, nullable=True)
    mvp_roadmap = Column(JSON, nullable=True)
    tech_stack = Column(JSON, nullable=True)
    branding = Column(JSON, nullable=True)
    pitch_deck = Column(JSON, nullable=True)
    business_plan = Column(JSON, nullable=True)
    success_prediction = Column(JSON, nullable=True)
    investor_readiness = Column(JSON, nullable=True)
    risk_analysis = Column(JSON, nullable=True)
    dna_analysis = Column(JSON, nullable=True)
    keywords = Column(JSON, nullable=True)
    similarity_analysis = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    idea = relationship("StartupIdea", back_populates="analyses")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("startup_ideas.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    pdf_path = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    idea = relationship("StartupIdea", back_populates="reports")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("startup_ideas.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    chat_id = Column(String(50), nullable=True, index=True)
    chat_title = Column(String(255), nullable=True)

    # Relationships
    idea = relationship("StartupIdea", back_populates="chat_history")

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="open")  # "open", "closed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="tickets")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="logs")
