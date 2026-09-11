import time
import requests
import json
import uuid

API_BASE = "http://127.0.0.1:8000/api"

IDEAS = [
    {
        "title": "MediChain Ledger",
        "description": "A HIPAA-compliant decentralized electronic health records (EHR) exchange platform enabling patients to securely control and grant temporary access to their medical histories across disparate hospital networks using zero-knowledge proofs.",
        "industry": "Healthcare",
        "category": "HealthTech",
        "subcategory": "EHR & Medical Security",
        "business_model": "B2B SaaS"
    },
    {
        "title": "FinSight AI",
        "description": "An autonomous AI financial controller and fraud detection engine for mid-market CFOs that connects to ERPs, reconciles multi-currency invoices in real time, and identifies treasury anomalies using predictive ML.",
        "industry": "Fintech",
        "category": "Enterprise Software",
        "subcategory": "Corporate Treasury & Fraud Prevention",
        "business_model": "B2B Subscription"
    },
    {
        "title": "SolarGrid Optimize",
        "description": "An IoT-driven microgrid optimization software for commercial warehouses and data centers that dynamically balances battery storage, solar array output, and utility grid peak pricing using real-time weather forecasting.",
        "industry": "CleanTech",
        "category": "Energy & Sustainability",
        "subcategory": "Smart Grid Management",
        "business_model": "Usage-based B2B"
    },
    {
        "title": "EduMentor XR",
        "description": "An immersive spatial computing and VR vocational training platform for industrial mechanics, aerospace technicians, and electrical engineers with haptic feedback simulation and automated skill certification.",
        "industry": "EdTech",
        "category": "AR/VR Training",
        "subcategory": "Vocational Workforce Upskilling",
        "business_model": "Enterprise Licensing"
    }
]

def run_stress_validation():
    results = []
    
    uid = uuid.uuid4().hex[:6]
    email = f"benchmark_{uid}@startupsense.ai"
    password = "Password123!"
    
    requests.post(f"{API_BASE}/auth/register", json={
        "email": email,
        "full_name": "Benchmark Tester",
        "password": password
    })
    
    login_res = requests.post(f"{API_BASE}/auth/login", data={"username": email, "password": password})
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        return
        
    auth_token = login_res.json().get("access_token")
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"Starting Multi-Run AI Validation Benchmark (4 Diverse Ideas)...")
    print("=" * 80)
    
    for idx, idea_data in enumerate(IDEAS, 1):
        print(f"\n[RUN {idx}/4] Validating: '{idea_data['title']}' ({idea_data['industry']})")
        
        # Create Idea
        create_res = requests.post(f"{API_BASE}/ideas/", json=idea_data, headers=headers)
        if create_res.status_code != 201:
            print(f"  [FAIL] Could not create idea: {create_res.status_code} {create_res.text}")
            continue
        idea_id = create_res.json()["id"]
        
        # Trigger AI Validation and measure precise latency
        t0 = time.time()
        val_res = requests.post(f"{API_BASE}/analysis/validate/{idea_id}", headers=headers)
        latency = round(time.time() - t0, 3)
        
        http_status = val_res.status_code
        has_429 = (http_status == 429 or "rate limit" in val_res.text.lower())
        
        if http_status not in (200, 201):
            print(f"  [ERROR] Validation API returned {http_status}: {val_res.text}")
            results.append({
                "run": idx,
                "idea": idea_data["title"],
                "latency_sec": latency,
                "http_status": http_status,
                "gemini_429": has_429,
                "passed": False,
                "error": val_res.text
            })
            continue
            
        analysis_id = val_res.json().get("analysis_id")
        
        # Retrieve Persisted Analysis from DB
        get_res = requests.get(f"{API_BASE}/analysis/{idea_id}", headers=headers)
        db_persisted = (get_res.status_code == 200)
        analysis_data = get_res.json() if db_persisted else {}
        
        # Deep Inspection of Sections & Quality
        swot = analysis_data.get("swot_analysis") or {}
        has_swot = bool(swot.get("strengths") and swot.get("weaknesses") and swot.get("opportunities") and swot.get("threats"))
        
        comp_obj = analysis_data.get("competitor_analysis") or {}
        comps = comp_obj.get("competitors") or []
        has_competitors = len(comps) > 0
        has_sentiments = all("sentiment" in c for c in comps) if comps else False
        
        biz = analysis_data.get("business_plan") or {}
        has_biz_plan = bool(biz.get("executive_summary") or biz.get("market_strategy"))
        
        pitch_obj = analysis_data.get("pitch_deck") or {}
        slides = pitch_obj.get("slides") or []
        has_pitch = len(slides) > 0
        
        dna = analysis_data.get("dna_analysis") or {}
        has_dna = bool(dna.get("overall_dna_score") is not None and dna.get("innovation_score") is not None)
        
        has_ml = bool(analysis_data.get("success_prediction") and analysis_data.get("risk_analysis") and analysis_data.get("investor_readiness"))
        
        rev_obj = analysis_data.get("revenue_model") or {}
        has_revenue = bool(rev_obj.get("revenue_forecast"))
        
        summary = analysis_data.get("summary", "")
        
        all_sections_present = all([has_swot, has_competitors, has_sentiments, has_biz_plan, has_pitch, has_dna, has_ml, has_revenue])
        status_pass = (http_status in (200, 201) and db_persisted and all_sections_present and not has_429)
        
        print(f"  [RESULT] Latency: {latency}s | DB ID: {analysis_id} | Status: {'PASS' if status_pass else 'FAIL'}")
        print(f"    - Summary snippet: {summary[:90]}...")
        print(f"    - SWOT: {len(swot.get('strengths',[]))} Strengths, {len(swot.get('weaknesses',[]))} Weaknesses, {len(swot.get('opportunities',[]))} Opportunities, {len(swot.get('threats',[]))} Threats")
        print(f"    - Competitors Identified: {len(comps)} (Sentiments attached: {has_sentiments})")
        print(f"    - Business Plan: {has_biz_plan} | Pitch Slides: {len(slides)}")
        print(f"    - DNA Score: {dna.get('overall_dna_score')} / 100 | ML Predictions: {has_ml}")
        print(f"    - Revenue Projections: {has_revenue} ({len(rev_obj.get('revenue_forecast', []))} periods)")
        
        results.append({
            "run": idx,
            "idea": idea_data["title"],
            "industry": idea_data["industry"],
            "latency_sec": latency,
            "http_status": http_status,
            "gemini_429": has_429,
            "db_persisted": db_persisted,
            "analysis_id": analysis_id,
            "summary_snippet": summary[:120],
            "sections": {
                "swot": has_swot,
                "competitors": has_competitors,
                "sentiments": has_sentiments,
                "business_plan": has_biz_plan,
                "pitch_deck": has_pitch,
                "dna_score": has_dna,
                "ml_predictions": has_ml,
                "revenue_forecast": has_revenue
            },
            "passed": status_pass
        })
        
        time.sleep(1.0)

    with open("multi_run_validation_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print("\n" + "=" * 80)
    print("Multi-Run Validation Completed. Summary written to multi_run_validation_results.json")

if __name__ == "__main__":
    run_stress_validation()
