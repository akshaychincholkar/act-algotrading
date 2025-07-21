import requests
from bs4 import BeautifulSoup

def get_scan_clause(screener_url, session):
    """Extract scan_clause from Chartink using a session (csrf included)."""
    r = session.get(screener_url)
    soup = BeautifulSoup(r.text, "html.parser")
    meta = soup.find("meta", {"name": "csrf-token"})
    if not meta:
        print("❌ CSRF token not found")
        return None

    session.headers["X-CSRF-Token"] = meta["content"]

    # scan_clause is embedded in the JavaScript; use hidden input as fallback
    input_tag = soup.find("input", {"id": "scan_clause"})
    if input_tag:
        return input_tag.get("value")

    print("❌ Could not find scan_clause input")
    return None

def call_chartink_api(session, scan_clause):
    """POST to Chartink with CSRF and return matched stocks."""
    url = "https://chartink.com/screener/process"
    payload = {"scan_clause": scan_clause}
    r = session.post(url, data=payload)
    if r.status_code == 200:
        for s in r.json().get("data", []):
            print(f"{s['nsecode']} — {s['name']} — LTP: {s['close']}")
    else:
        print("❌ API call failed:", r.status_code)

# Main
session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0"})
url = "https://chartink.com/screener/bittu-daily-trading"

scan_clause = get_scan_clause(url, session)
if scan_clause:
    print("✅ Scan clause extracted successfully.\n")
    call_chartink_api(session, scan_clause)
else:
    print("❌ Failed to extract scan clause.")
