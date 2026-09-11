import os
import re
from urllib.parse import urlparse
from typing import List, Dict, Any
from dotenv import load_dotenv
from duckduckgo_search import DDGS

load_dotenv()

SEARCH_API_KEY = os.getenv("SEARCH_API_KEY")

def clean_domain(url: str) -> str:
    """Extracts a clean domain or host name from a URL."""
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc or parsed.path
        netloc = re.sub(r'^www\.', '', netloc)
        return netloc.split('/')[0].strip()
    except Exception:
        return ""

def search_competitors_and_trends(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Fetches real-time search results for competitors, products, and market trends using DuckDuckGo Search.
    Extracts title, body, link, and clean domain.
    Returns an empty list upon failure or timeout (NEVER fabricates fake competitors).
    """
    results: List[Dict[str, Any]] = []
    seen_domains = set()

    try:
        with DDGS(timeout=5) as ddgs:
            ddg_results = ddgs.text(query, max_results=max_results)
            if ddg_results:
                for r in ddg_results:
                    link = r.get("href", "") or r.get("link", "")
                    domain = clean_domain(link)
                    # Deduplicate search results by domain
                    if domain and domain in seen_domains:
                        continue
                    if domain:
                        seen_domains.add(domain)

                    title = r.get("title", "").strip()
                    snippet = r.get("body", "") or r.get("snippet", "")
                    if title or snippet:
                        results.append({
                            "title": title,
                            "snippet": snippet.strip(),
                            "link": link,
                            "domain": domain
                        })
    except Exception as e:
        print(f"DuckDuckGo Search warning/timeout ({query}): {e}")
        # Return empty list on failure to ensure anti-hallucination compliance
        results = []

    return results

def multi_angle_competitor_search(title: str, description: str, industry: str = None) -> List[Dict[str, Any]]:
    """
    Executes multi-query search to uncover direct, indirect, and adjacent competitors.
    """
    queries = [
        f"{title} alternatives competitors software",
        f"{industry or ''} {title} products companies"
    ]
    
    combined_results: List[Dict[str, Any]] = []
    seen_urls = set()

    for q in queries:
        try:
            res = search_competitors_and_trends(q.strip(), max_results=4)
            for item in res:
                link = item.get("link", "")
                if link and link not in seen_urls:
                    seen_urls.add(link)
                    combined_results.append(item)
        except Exception:
            continue

    return combined_results[:8]
