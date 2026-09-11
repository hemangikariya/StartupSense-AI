import sqlite3
import json

conn = sqlite3.connect("d:/StartupSense-AI/startupsense.db")
cursor = conn.cursor()

cursor.execute("SELECT id, idea_id, summary, swot_analysis, competitor_analysis, business_plan, pitch_deck, dna_analysis, revenue_model FROM analyses WHERE id IN (7, 8, 9, 10)")
rows = cursor.fetchall()

print(f"Retrieved {len(rows)} analyses generated from the 4 runs:")
print("=" * 80)

for r in rows:
    analysis_id, idea_id, summary, swot, competitors, biz_plan, pitch_deck, dna, rev_model = r
    
    # Check idea title
    cursor.execute("SELECT title, industry FROM startup_ideas WHERE id = ?", (idea_id,))
    idea_row = cursor.fetchone()
    title = idea_row[0] if idea_row else f"Idea #{idea_id}"
    industry = idea_row[1] if idea_row else "Unknown"
    
    swot_dict = json.loads(swot) if isinstance(swot, str) else swot
    comp_dict = json.loads(competitors) if isinstance(competitors, str) else competitors
    biz_dict = json.loads(biz_plan) if isinstance(biz_plan, str) else biz_plan
    pitch_dict = json.loads(pitch_deck) if isinstance(pitch_deck, str) else pitch_deck
    dna_dict = json.loads(dna) if isinstance(dna, str) else dna
    rev_dict = json.loads(rev_model) if isinstance(rev_model, str) else rev_model
    
    strengths = swot_dict.get("strengths", []) if isinstance(swot_dict, dict) else []
    comps = comp_dict.get("competitors", []) if isinstance(comp_dict, dict) else []
    slides = pitch_dict.get("slides", []) if isinstance(pitch_dict, dict) else []
    overall_dna = dna_dict.get("overall_dna_score") if isinstance(dna_dict, dict) else None
    forecast = rev_dict.get("revenue_forecast", []) if isinstance(rev_dict, dict) else []
    
    has_sentiments = all("sentiment" in c for c in comps) if comps else False
    
    print(f"\n[ANALYSIS ID {analysis_id}] Idea: '{title}' ({industry})")
    print(f"  - Summary: {summary[:100]}...")
    print(f"  - SWOT Strengths ({len(strengths)}): {strengths[:2]}")
    print(f"  - Competitors ({len(comps)}): {[c.get('name') for c in comps[:3]]} (Sentiments attached: {has_sentiments})")
    print(f"  - Pitch Deck Slides: {len(slides)} slides")
    print(f"  - Overall DNA Score: {overall_dna} / 100")
    print(f"  - Revenue Forecast Periods: {len(forecast)}")
    print(f"  - Executive Summary: {str(biz_dict.get('executive_summary', ''))[:90]}...")

conn.close()
