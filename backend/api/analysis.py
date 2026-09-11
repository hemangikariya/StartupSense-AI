from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils
from backend.services import ai_service, ml_service, nlp_service, forecast_service

router = APIRouter(prefix="/analysis", tags=["Startup Analysis"])

import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=6)

@router.post("/validate/{idea_id}", status_code=status.HTTP_201_CREATED)
async def validate_idea(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    """
    Triggers the complete AI + ML + NLP validation pipeline for a startup idea.
    Uses concurrent execution for independent LLM, ML, and NLP tasks to optimize latency.
    Stores results in the PostgreSQL/SQLite 'analyses' table.
    """
    # 1. Fetch idea and verify ownership
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to analyze this idea")
        
    # Check if analysis already exists to prevent duplicate generation unless forced
    existing_analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    if existing_analysis:
        return {"message": "Idea already analyzed", "analysis_id": existing_analysis.id}

    loop = asyncio.get_event_loop()

    # Step 1: Run Stage 1 tasks concurrently:
    # - Local NLP keyword extraction
    # - Core AI analysis (Gemini + live DDG search)
    # - Strategic SWOT analysis (Gemini)
    # - Live Competitor discovery & analysis (DDG search + Gemini)
    # - Business Plan generation (Gemini)
    # - Pitch Deck generation (Gemini)
    
    async def safe_task(func, *args):
        try:
            return await loop.run_in_executor(executor, func, *args)
        except Exception as e:
            print(f"Concurrent task error in {func.__name__}: {e}")
            return None

    (
        nlp_keywords,
        ai_report,
        swot,
        competitors,
        biz_plan,
        pitch_deck
    ) = await asyncio.gather(
        safe_task(nlp_service.extract_keywords_and_concepts, idea.description),
        safe_task(ai_service.generate_startup_analysis, idea.title, idea.description, idea.industry),
        safe_task(ai_service.generate_swot, idea.title, idea.description),
        safe_task(ai_service.generate_competitor_analysis, idea.title, idea.description, idea.industry),
        safe_task(ai_service.generate_business_plan, idea.title, idea.description, idea.industry),
        safe_task(ai_service.generate_pitch_deck, idea.title, idea.description)
    )

    # Fallback guarantees if any individual task errored
    if not nlp_keywords:
        nlp_keywords = nlp_service.extract_keywords_and_concepts(idea.description)
    if not ai_report:
        ai_report = ai_service.generate_startup_analysis(idea.title, idea.description, idea.industry)
    if not swot:
        swot = ai_service.generate_swot(idea.title, idea.description)
    if not competitors:
        competitors = ai_service.generate_competitor_analysis(idea.title, idea.description, idea.industry)
    if not biz_plan:
        biz_plan = ai_service.generate_business_plan(idea.title, idea.description, idea.industry)
    if not pitch_deck:
        pitch_deck = ai_service.generate_pitch_deck(idea.title, idea.description)

    # Update industry classification if generated
    classification = ai_report.get("classification", {})
    idea.industry = classification.get("industry", idea.industry)
    idea.category = classification.get("category", idea.category)
    idea.subcategory = classification.get("subcategory", idea.subcategory)
    idea.business_model = classification.get("business_model", idea.business_model)
    db.commit()

    # Step 2: Parallelize Competitor Sentiment Analysis
    async def get_sentiment(comp):
        sent = await loop.run_in_executor(executor, nlp_service.analyze_competitor_sentiment, comp["name"])
        comp["sentiment"] = sent.get("sentiment", {})
        comp["praises"] = sent.get("praises", [])
        comp["complaints"] = sent.get("complaints", [])
        return comp

    if competitors:
        competitors = await asyncio.gather(*[get_sentiment(c) for c in competitors])

    # Step 3: Run ML Predictions & Forecasting
    # ML Success prediction
    success_pred = ml_service.predict_startup_success(
        description_len=len(idea.description),
        industry=idea.industry or "General",
        business_model=idea.business_model or "B2B",
        team_size=3
    )
    
    # ML Risk & Investor Readiness
    risk_pred = ml_service.predict_startup_risks(idea.title, idea.description)
    investor_pred = ml_service.predict_investor_readiness(idea.title, idea.description, success_pred["success_probability"])

    # DNA Engine Calculations
    dna = {
        "innovation_score": int(80 + (len(idea.title) % 15)),
        "scalability_score": int(75 + (len(idea.description) % 20)),
        "market_demand_score": int(success_pred["success_probability"]),
        "execution_score": int(100 - risk_pred["execution_risk"]),
        "moat_score": int(100 - investor_pred["investor_score"] * 0.2),
        "overall_dna_score": int((80 + 75 + success_pred["success_probability"] + (100 - risk_pred["execution_risk"])) / 4)
    }

    # NLP Similarity calculation vs existing database records
    other_ideas = db.query(models.StartupIdea).filter(models.StartupIdea.id != idea_id).all()
    other_ideas_dicts = [{"title": oi.title, "description": oi.description} for oi in other_ideas]
    similarity = nlp_service.calculate_idea_similarity(idea.description, other_ideas_dicts)

    # Forecasting & Revenue projections
    revenue_forecast = forecast_service.forecast_startup_revenue(
        base_revenue=5000.0,
        growth_rate=0.10,
        months_to_forecast=12
    )
    market_growth = forecast_service.forecast_industry_growth(idea.industry or "General")

    # Technology Stack & Branding metadata
    tech_stack = {
        "frontend": "React 19, TypeScript, Tailwind CSS, Recharts",
        "backend": "FastAPI (Python), Uvicorn, SQLAlchemy",
        "database": "PostgreSQL / SQLite, Redis Cache",
        "ai_ml": "Gemini API, Scikit-Learn, Prophet",
        "hosting": "AWS ECS / Cloud Server, Vercel"
    }
    
    branding = {
        "startup_names": [f"{idea.title}ly", f"Sense{idea.title}", f"Net{idea.title}"],
        "domain_suggestions": [f"{idea.title.lower().replace(' ', '')}.ai", f"get{idea.title.lower().replace(' ', '')}.com"],
        "logo_prompt": f"Modern minimalist vector logo for {idea.title}, showing technology, growth, and intelligence, dark slate blue background, clean geometry."
    }

    # Save complete analysis to Database
    db_analysis = models.Analysis(
        idea_id=idea_id,
        summary=ai_report.get("summary", ""),
        problem_statement=ai_report.get("problem_statement", ""),
        solution=ai_report.get("solution", ""),
        target_audience=ai_report.get("target_audience", ""),
        swot_analysis=swot,
        competitor_analysis={"competitors": competitors},
        market_opportunity={"market_growth": market_growth},
        revenue_model={"revenue_forecast": revenue_forecast},
        mvp_roadmap={
            "phases": [
                {"phase": "Phase 1: MVP Core", "duration": "4 Weeks", "deliverables": ["User auth setup", "Database schema", "Core workflow dashboard"]},
                {"phase": "Phase 2: Beta Launch", "duration": "6 Weeks", "deliverables": ["Third-party integrations", "AI analytical recommendations", "Payment gates"]},
                {"phase": "Phase 3: Scale", "duration": "8 Weeks", "deliverables": ["Analytics expansion", "Collaboration workspaces", "Automated marketing engines"]}
            ]
        },
        tech_stack=tech_stack,
        branding=branding,
        pitch_deck={"slides": pitch_deck},
        business_plan=biz_plan,
        success_prediction=success_pred,
        investor_readiness=investor_pred,
        risk_analysis=risk_pred,
        dna_analysis=dna,
        keywords=nlp_keywords,
        similarity_analysis=similarity
    )
    
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    # Log action
    log = models.ActivityLog(
        user_id=current_user.id,
        action="validate_idea",
        details=f"Validated idea ID: {idea_id}, generated full analysis report."
    )
    db.add(log)
    db.commit()

    return {"message": "Validation complete", "analysis_id": db_analysis.id}

@router.get("/{idea_id}")
def get_analysis(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    """
    Retrieves the stored analysis for a startup idea.
    """
    idea = db.query(models.StartupIdea).filter(models.StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    if idea.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this analysis")
        
    analysis = db.query(models.Analysis).filter(models.Analysis.idea_id == idea_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis report has not been generated yet")
    return analysis
