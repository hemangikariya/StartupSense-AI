import time
import requests
import json
import os

BASE_URL = "http://localhost:8000/api"

results = []

def record(test_name, expected, actual, duration, status, notes=""):
    results.append({
        "test": test_name,
        "expected": expected,
        "actual": actual,
        "duration": f"{duration:.3f}s",
        "status": status,
        "notes": notes
    })
    print(f"[{status}] {test_name} ({duration:.3f}s) - {notes}")

# 1. Registration
t0 = time.time()
user_payload = {
    "email": f"founder_qa_{int(time.time())}@startupsense.ai",
    "password": "Password123!",
    "full_name": "QA Senior Tester"
}
try:
    r = requests.post(f"{BASE_URL}/auth/register", json=user_payload)
    d = time.time() - t0
    if r.status_code == 201:
        record("1. User Registration", "HTTP 201 Created", f"HTTP {r.status_code}", d, "PASS")
    else:
        record("1. User Registration", "HTTP 201 Created", f"HTTP {r.status_code}: {r.text}", d, "FAIL", r.text)
except Exception as e:
    record("1. User Registration", "HTTP 201 Created", str(e), 0, "FAIL", str(e))

# 2. Login
t0 = time.time()
try:
    r = requests.post(f"{BASE_URL}/auth/login", data={"username": user_payload["email"], "password": user_payload["password"]})
    d = time.time() - t0
    if r.status_code == 200 and "access_token" in r.json():
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        record("2. User Login & Token Generation", "HTTP 200 + JWT Token", f"HTTP {r.status_code}", d, "PASS")
    else:
        token = None
        headers = {}
        record("2. User Login & Token Generation", "HTTP 200 + JWT Token", f"HTTP {r.status_code}", d, "FAIL")
except Exception as e:
    record("2. User Login & Token Generation", "HTTP 200 + JWT Token", str(e), 0, "FAIL", str(e))

# 3. User Profile /me
t0 = time.time()
try:
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    d = time.time() - t0
    if r.status_code == 200 and r.json().get("email") == user_payload["email"]:
        record("3. User Profile Verification (/me)", "HTTP 200 + Current User Profile", f"HTTP {r.status_code}", d, "PASS")
    else:
        record("3. User Profile Verification (/me)", "HTTP 200", f"HTTP {r.status_code}", d, "FAIL")
except Exception as e:
    record("3. User Profile Verification (/me)", "HTTP 200", str(e), 0, "FAIL", str(e))

# 4. Create Startup Idea
t0 = time.time()
idea_payload = {
    "title": "EcoClean IoT",
    "description": "AI-powered waste management platform for Indian apartment societies using IoT sensors to predict waste generation and optimize collection schedules.",
    "industry": "AI SaaS",
    "business_model": "B2B SaaS"
}
try:
    r = requests.post(f"{BASE_URL}/ideas", json=idea_payload, headers=headers)
    d = time.time() - t0
    if r.status_code == 201 and "id" in r.json():
        idea_id = r.json()["id"]
        record("4. Startup Idea Creation", "HTTP 201 + Idea ID", f"HTTP {r.status_code} (ID: {idea_id})", d, "PASS")
    else:
        idea_id = None
        record("4. Startup Idea Creation", "HTTP 201", f"HTTP {r.status_code}", d, "FAIL", r.text)
except Exception as e:
    idea_id = None
    record("4. Startup Idea Creation", "HTTP 201", str(e), 0, "FAIL", str(e))

# 5. List User Ideas
t0 = time.time()
try:
    r = requests.get(f"{BASE_URL}/ideas", headers=headers)
    d = time.time() - t0
    if r.status_code == 200 and len(r.json()) > 0:
        record("5. List User Ideas / Context Switcher", "HTTP 200 + Non-empty List", f"HTTP {r.status_code} ({len(r.json())} ideas)", d, "PASS")
    else:
        record("5. List User Ideas / Context Switcher", "HTTP 200", f"HTTP {r.status_code}", d, "FAIL")
except Exception as e:
    record("5. List User Ideas / Context Switcher", "HTTP 200", str(e), 0, "FAIL", str(e))

# 6. Complete AI Validation Pipeline
if idea_id:
    t0 = time.time()
    try:
        r = requests.post(f"{BASE_URL}/analysis/validate/{idea_id}", headers=headers)
        d = time.time() - t0
        if r.status_code == 201 and "analysis_id" in r.json():
            record("6. End-to-End AI Validation Pipeline", "HTTP 201 Validation Complete", f"HTTP {r.status_code}", d, "PASS", f"Latency: {d:.2f}s (NLP + Live Search + Gemini + ML + Prophet)")
        else:
            record("6. End-to-End AI Validation Pipeline", "HTTP 201", f"HTTP {r.status_code}: {r.text}", d, "FAIL", r.text)
    except Exception as e:
        record("6. End-to-End AI Validation Pipeline", "HTTP 201", str(e), 0, "FAIL", str(e))

# 7. Complete Analysis Entity Fetch
if idea_id:
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/analysis/{idea_id}", headers=headers)
        d = time.time() - t0
        data = r.json()
        if r.status_code == 200 and data.get("swot_analysis") and data.get("competitor_analysis") and data.get("success_prediction"):
            record("7. Executive Analysis Aggregator", "HTTP 200 with full SWOT/Competitors/ML/DNA/Risk data", f"HTTP {r.status_code}", d, "PASS")
        else:
            record("7. Executive Analysis Aggregator", "HTTP 200 with full schema", f"HTTP {r.status_code}", d, "FAIL")
    except Exception as e:
        record("7. Executive Analysis Aggregator", "HTTP 200", str(e), 0, "FAIL", str(e))

# 8. ML Predictions Endpoints
if idea_id:
    endpoints = [
        ("/predictions/success/", "8. ML Success Prediction"),
        ("/predictions/investor/", "9. Investor Readiness Score"),
        ("/predictions/risk/", "10. ML Risk Dimension Analysis"),
        ("/predictions/dna/", "11. Startup DNA Composite Scoring"),
        ("/forecast/revenue/", "12. Prophet Revenue Forecast"),
        ("/forecast/market/", "13. Market Growth Projections")
    ]
    for ep, name in endpoints:
        t0 = time.time()
        try:
            r = requests.get(f"{BASE_URL}{ep}{idea_id}", headers=headers)
            d = time.time() - t0
            if r.status_code == 200 and r.json():
                record(name, "HTTP 200 + JSON Metric Payload", f"HTTP {r.status_code}", d, "PASS")
            else:
                record(name, "HTTP 200", f"HTTP {r.status_code}", d, "FAIL")
        except Exception as e:
            record(name, "HTTP 200", str(e), 0, "FAIL", str(e))

# 14. AI Mentor Chat (Valid & Contextual)
if idea_id:
    t0 = time.time()
    try:
        q = "My competitor already has 100,000 users. Why should Indian societies choose EcoClean IoT?"
        r = requests.post(f"{BASE_URL}/mentor/chat/ask/{idea_id}?question={requests.utils.quote(q)}", headers=headers)
        d = time.time() - t0
        if r.status_code == 200 and len(r.json().get("answer", "")) > 10:
            record("14. AI Mentor Chat (Strategic Question)", "HTTP 200 + Context-Aware Advice", f"HTTP {r.status_code}", d, "PASS", f"Answer snippet: {r.json()['answer'][:60]}...")
        else:
            record("14. AI Mentor Chat (Strategic Question)", "HTTP 200", f"HTTP {r.status_code}", d, "FAIL")
    except Exception as e:
        record("14. AI Mentor Chat (Strategic Question)", "HTTP 200", str(e), 0, "FAIL", str(e))

# 15. AI Mentor Chat Edge Case (Vague & Minimal)
if idea_id:
    t0 = time.time()
    try:
        q = "Should I pivot?"
        r = requests.post(f"{BASE_URL}/mentor/chat/ask/{idea_id}?question={requests.utils.quote(q)}", headers=headers)
        d = time.time() - t0
        if r.status_code == 200 and r.json().get("answer"):
            record("15. AI Mentor Chat (Vague / Short Question)", "HTTP 200 + Grounded Guidance", f"HTTP {r.status_code}", d, "PASS")
        else:
            record("15. AI Mentor Chat (Vague / Short Question)", "HTTP 200", f"HTTP {r.status_code}", d, "FAIL")
    except Exception as e:
        record("15. AI Mentor Chat (Vague / Short Question)", "HTTP 200", str(e), 0, "FAIL", str(e))

# 16. Chat History & Transcript Export
if idea_id:
    t0 = time.time()
    try:
        r_hist = requests.get(f"{BASE_URL}/mentor/history?idea_id={idea_id}", headers=headers)
        d = time.time() - t0
        sessions = r_hist.json()
        if r_hist.status_code == 200 and len(sessions) > 0:
            cid = sessions[0]["chat_id"]
            r_exp = requests.post(f"{BASE_URL}/mentor/history/export", json={"chat_id": cid}, headers=headers)
            if r_exp.status_code == 200 and "content" in r_exp.json():
                record("16. Chat History & Session Export", "HTTP 200 + Formatted Transcript", f"HTTP {r_exp.status_code}", d, "PASS")
            else:
                record("16. Chat History & Session Export", "HTTP 200", f"Export HTTP {r_exp.status_code}", d, "FAIL")
        else:
            record("16. Chat History & Session Export", "HTTP 200", "No sessions returned", d, "FAIL")
    except Exception as e:
        record("16. Chat History & Session Export", "HTTP 200", str(e), 0, "FAIL", str(e))

# 17. PDF Dossier Report Generation & Download
if idea_id:
    t0 = time.time()
    try:
        r_gen = requests.post(f"{BASE_URL}/reports/generate/{idea_id}", headers=headers)
        d = time.time() - t0
        if r_gen.status_code == 201 and "id" in r_gen.json():
            rep_id = r_gen.json()["id"]
            r_dl = requests.get(f"{BASE_URL}/reports/download/{rep_id}", headers=headers)
            if r_dl.status_code == 200 and len(r_dl.content) > 1000:
                record("17. PDF Report Generation & Stream Download", "HTTP 201 + Valid Binary PDF", f"HTTP {r_dl.status_code} ({len(r_dl.content)} bytes)", d, "PASS")
            else:
                record("17. PDF Report Generation & Stream Download", "HTTP 200 binary", f"HTTP {r_dl.status_code}", d, "FAIL")
        else:
            record("17. PDF Report Generation & Stream Download", "HTTP 201", f"HTTP {r_gen.status_code}", d, "FAIL")
    except Exception as e:
        record("17. PDF Report Generation & Stream Download", "HTTP 200", str(e), 0, "FAIL", str(e))

# 18. Support Tickets (Create & List)
t0 = time.time()
try:
    r_t = requests.post(f"{BASE_URL}/support/tickets", json={"subject": "Inquiry on ML models", "message": "What is the training set distribution?"}, headers=headers)
    d = time.time() - t0
    if r_t.status_code == 201:
        r_list = requests.get(f"{BASE_URL}/support/tickets", headers=headers)
        if r_list.status_code == 200 and len(r_list.json()) > 0:
            record("18. Support Ticket Submission & Retrieval", "HTTP 201 + Ticket in user list", f"HTTP {r_list.status_code}", d, "PASS")
        else:
            record("18. Support Ticket Submission & Retrieval", "HTTP 200", f"List failed", d, "FAIL")
    else:
        record("18. Support Ticket Submission & Retrieval", "HTTP 201", f"HTTP {r_t.status_code}", d, "FAIL")
except Exception as e:
    record("18. Support Ticket Submission & Retrieval", "HTTP 201", str(e), 0, "FAIL", str(e))

# 19. User Isolation Security Test
t0 = time.time()
try:
    user2 = {"email": f"hacker_user_{int(time.time())}@startupsense.ai", "password": "Password123!", "full_name": "Unauthorized User"}
    requests.post(f"{BASE_URL}/auth/register", json=user2)
    r2_login = requests.post(f"{BASE_URL}/auth/login", data={"username": user2["email"], "password": user2["password"]})
    token2 = r2_login.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Attempt to access User 1's idea
    r_breach = requests.get(f"{BASE_URL}/ideas/{idea_id}", headers=headers2)
    d = time.time() - t0
    if r_breach.status_code == 403:
        record("19. User Data Isolation Security Check", "HTTP 403 Forbidden on Unauthorized Resource", f"HTTP 403", d, "PASS")
    else:
        record("19. User Data Isolation Security Check", "HTTP 403 Forbidden", f"HTTP {r_breach.status_code} (SECURITY VULNERABILITY!)", d, "FAIL")
except Exception as e:
    record("19. User Data Isolation Security Check", "HTTP 403", str(e), 0, "FAIL", str(e))

# Write results to json
with open("d:\\StartupSense-AI\\qa_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
print("QA Test Suite Completed. Summary saved to qa_results.json.")
