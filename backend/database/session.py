import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to local SQLite database if Postgres is not configured or set to placeholder
if not DATABASE_URL or DATABASE_URL == "REPLACE_ME" or DATABASE_URL.strip() == "":
    # SQLite fallback
    DATABASE_URL = "sqlite:///./startupsense.db"
    # sqlite needs check_same_thread=False
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

# Create engine
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base
Base = declarative_base()

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
