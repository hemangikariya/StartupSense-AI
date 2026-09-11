import os
import time
import requests
from typing import Dict, Any

# Canonical Supported Currencies
SUPPORTED_CURRENCIES = {
    "USD": {"symbol": "$", "name": "US Dollar", "locale": "en-US"},
    "INR": {"symbol": "₹", "name": "Indian Rupee", "locale": "en-IN"},
    "EUR": {"symbol": "€", "name": "Euro", "locale": "de-DE"},
    "GBP": {"symbol": "£", "name": "British Pound", "locale": "en-GB"},
    "AED": {"symbol": "د.إ", "name": "UAE Dirham", "locale": "ar-AE"},
    "CAD": {"symbol": "C$", "name": "Canadian Dollar", "locale": "en-CA"},
    "AUD": {"symbol": "A$", "name": "Australian Dollar", "locale": "en-AU"},
    "SGD": {"symbol": "S$", "name": "Singapore Dollar", "locale": "en-SG"},
    "JPY": {"symbol": "¥", "name": "Japanese Yen", "locale": "ja-JP"},
}

# Reliable fallback rates against 1.0 USD
FALLBACK_RATES = {
    "USD": 1.0,
    "INR": 86.85,
    "EUR": 0.93,
    "GBP": 0.79,
    "AED": 3.67,
    "CAD": 1.38,
    "AUD": 1.54,
    "SGD": 1.34,
    "JPY": 152.40
}

# In-memory cache with 6-hour TTL
_rates_cache: Dict[str, Any] = {
    "rates": FALLBACK_RATES.copy(),
    "timestamp": 0,
    "source": "fallback"
}
CACHE_TTL_SECONDS = 6 * 3600  # 6 hours

def get_exchange_rates() -> Dict[str, Any]:
    """
    Fetches live exchange rates against USD with in-memory caching and fallback.
    Returns:
      {
        "base": "USD",
        "rates": {...},
        "updated_at": "ISO string",
        "source": "live" | "cached" | "fallback",
        "supported_currencies": SUPPORTED_CURRENCIES
      }
    """
    global _rates_cache
    now = time.time()
    
    # Return cached rates if fresh
    if _rates_cache["timestamp"] > 0 and (now - _rates_cache["timestamp"] < CACHE_TTL_SECONDS):
        return {
            "base": "USD",
            "rates": _rates_cache["rates"],
            "timestamp": _rates_cache["timestamp"],
            "source": "cached",
            "supported_currencies": SUPPORTED_CURRENCIES
        }

    try:
        # Fast open exchange rate endpoint (no auth needed)
        resp = requests.get("https://open.er-api.com/v6/latest/USD", timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            raw_rates = data.get("rates", {})
            updated_rates = {}
            for code in SUPPORTED_CURRENCIES.keys():
                if code in raw_rates:
                    updated_rates[code] = float(raw_rates[code])
                else:
                    updated_rates[code] = FALLBACK_RATES.get(code, 1.0)

            _rates_cache = {
                "rates": updated_rates,
                "timestamp": now,
                "source": "live"
            }
            return {
                "base": "USD",
                "rates": updated_rates,
                "timestamp": now,
                "source": "live",
                "supported_currencies": SUPPORTED_CURRENCIES
            }
    except Exception as e:
        print(f"Currency rates fetch error (using fallback): {e}")

    # Fallback return
    return {
        "base": "USD",
        "rates": FALLBACK_RATES,
        "timestamp": now,
        "source": "fallback",
        "supported_currencies": SUPPORTED_CURRENCIES
    }

def convert_usd_to(amount_usd: float, target_currency: str) -> float:
    """
    Converts a canonical USD float amount to target currency.
    """
    rates = get_exchange_rates().get("rates", FALLBACK_RATES)
    rate = rates.get(target_currency.upper(), 1.0)
    return float(amount_usd) * float(rate)
