import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_currency_and_competitor():
    print("1. Testing /api/currency/rates endpoint...")
    r = requests.get(f"{BASE_URL}/currency/rates")
    assert r.status_code == 200, f"Failed rates: {r.status_code}"
    data = r.json()
    print("   Rates response:", data.get("base"), "with keys:", list(data.get("rates", {}).keys()))
    assert "INR" in data.get("rates", {})
    assert "EUR" in data.get("rates", {})
    assert "GBP" in data.get("rates", {})
    print("   [PASS] Rates endpoint verified.")

    print("\n2. Testing /api/currency/supported endpoint...")
    r2 = requests.get(f"{BASE_URL}/currency/supported")
    assert r2.status_code == 200
    supp = r2.json()
    print("   Supported count:", len(supp), "INR symbol:", supp.get("INR", {}).get("symbol"))
    assert supp.get("INR", {}).get("symbol") == "₹"
    print("   [PASS] Supported currencies endpoint verified.")

if __name__ == "__main__":
    test_currency_and_competitor()
