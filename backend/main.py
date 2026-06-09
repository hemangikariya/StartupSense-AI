import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database.session import Base, engine
from backend.api import auth, ideas, analysis, mentor, reports, admin, support, forecast, prediction

# Initialize DB tables on startup
# This creates all tables in PostgreSQL (or SQLite fallback) on application boot.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StartupSense AI API",
    description="Production-grade AI + ML + GenAI Startup Validation & Intelligence Platform",
    version="1.0.0"
)

# CORS setup for React frontend communication
origins = [
    "http://localhost:5173", # Vite local server
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory for reports (if static download is needed directly)
static_reports_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(static_reports_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_reports_dir), name="static")

# Register API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(ideas.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(mentor.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(support.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(prediction.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "StartupSense AI SaaS Backend",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main.py:app", host="0.0.0.0", port=8000, reload=True)
