from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database import models
from backend.utils import auth_utils
from backend.services import ai_service, ml_service, nlp_service, forecast_service

router = APIRouter(prefix="/analysis", tags=["Startup Analysis"])

@router.post("/validate/{idea_id}", status_code=status.HTTP_201_CREATED)
def validate_idea(idea_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    """
    Triggers the complete AI + ML + NLP validation pipeline for a startup idea.
    Stores results in the PostgreSQL 'analyses' table.
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

    # 2. Run NLP classification & keyword extraction locally
    nlp_keywords = nlp_service.extract_keywords_and_concepts(idea.description)
    
    # 3. Call AI Service (Gemini) for high-level core analysis
    ai_report = ai_service.generate_startup_analysis(idea.title, idea.description, idea.industry)
    
    # Update industry classification if generated
    classification = ai_report.get("classification", {})
    idea.industry = classification.get("industry", idea.industry)
    idea.category = classification.get("category", idea.category)
    idea.subcategory = classification.get("subcategory", idea.subcategory)
    idea.business_model = classification.get("business_model", idea.business_model)
    db.commit()

    # 4. Run SWOT and competitor generation
    swot = ai_service.generate_swot(idea.title, idea.description)
    competitors = ai_service.generate_competitor_analysis(idea.title, idea.description, idea.industry)
    
    # Sentiment analysis on each competitor
    for comp in competitors:
        sentiment_metrics = nlp_service.analyze_competitor_sentiment(comp["name"])
        comp["sentiment"] = sentiment_metrics["sentiment"]
        comp["praises"] = sentiment_metrics["praises"]
        comp["complaints"] = sentiment_metrics["complaints"]

    # 5. Run ML Success & Risk Predictions
    success_pred = ml_service.predict_startup_success(
        description_len=len(idea.description),
        industry=idea.industry or "General",
        business_model=idea.business_model or "B2B",
        team_size=3
    )
    
    risk_pred = ml_service.predict_startup_risks(idea.title, idea.description)
    investor_pred = ml_service.predict_investor_readiness(idea.title, idea.description, success_pred["success_probability"])
    
    # 6. Run DNA Engine Calculations
    dna = {
        "innovation_score": int(80 + (len(idea.title) % 15)),
        "scalability_score": int(75 + (len(idea.description) % 20)),
        "market_demand_score": int(success_pred["success_probability"]),
        "execution_score": int(100 - risk_pred["execution_risk"]),
        "moat_score": int(100 - investor_pred["investor_score"] * 0.2),
        "overall_dna_score": int((80 + 75 + success_pred["success_probability"] + (100 - risk_pred["execution_risk"])) / 4)
    }

    # 7. Run NLP Similarity compared to other platform ideas
    other_ideas = db.query(models.StartupIdea).filter(models.StartupIdea.id != idea_id).all()
    other_ideas_dicts = [{"title": oi.title, "description": oi.description} for oi in other_ideas]
    similarity = nlp_service.calculate_idea_similarity(idea.description, other_ideas_dicts)

    # 8. Run Business Plan & Pitch Deck outlines
    biz_plan = ai_service.generate_business_plan(idea.title, idea.description, idea.industry)
    pitch_deck = ai_service.generate_pitch_deck(idea.title, idea.description)

    # 9. Run Forecasting & Revenue projections (Prophet)
    revenue_forecast = forecast_service.forecast_startup_revenue(
        base_revenue=5000.0,
        growth_rate=0.10,
        months_to_forecast=12
    )
    
    market_growth = forecast_service.forecast_industry_growth(idea.industry or "General")

    # 10. Generate Technology Stack & Branding details
    tech_stack = {
        "frontend": "React 19, TypeScript, Tailwind CSS, Recharts",
        "backend": "FastAPI (Python), Uvicorn, SQLAlchemy",
        "database": "PostgreSQL, Redis Cache",
        "ai_ml": "Gemini API, Scikit-Learn, Prophet",
        "hosting": "Docker, AWS ECS, Vercel"
    }
    
    branding = {
        "startup_names": [f"{idea.title}ly", f"Sense{idea.title}", f"Net{idea.title}"],
        "domain_suggestions": [f"{idea.title.lower().replace(' ', '')}.ai", f"get{idea.title.lower().replace(' ', '')}.com"],
        "logo_prompt": f"Modern minimalist vector logo for {idea.title}, showing technology, growth, and intelligence, dark slate blue background, clean geometry."
    }

    # Save to Database
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
