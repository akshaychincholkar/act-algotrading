import requests
from bs4 import BeautifulSoup
import re
from .chartink_scan_clause import open_chartink_browser_and_print_scan_clause

# Add import for Screener model
from ..models.screener import Screener


def fetch_chartink_screener(screener_name):
    """
    Given a screener_name, fetch the scan_clause from the Screener table and run the screener to get stocks.
    """
    # Fetch scan_clause from the Screener table
    try:
        screener_obj = Screener.objects.filter(screener_name=screener_name).first()
    except Exception as e:
        print(f"Error fetching screener from DB: {e}")
        screener_obj = None
    scan_clause = getattr(screener_obj, 'scan_clause', None)

    # Check if scan_clause is None, empty, or blank
    if scan_clause is None or (isinstance(scan_clause, str) and scan_clause.strip() == ""):
        from requests.exceptions import HTTPError
        raise HTTPError("404 Client Error: screener is not present. Please verify the screener name", response=None)

    # Step 1: Load the homepage to get the CSRF token
    session = requests.Session()
    homepage = session.get("https://chartink.com/")
    soup = BeautifulSoup(homepage.text, "html.parser")

    token_input = soup.find("meta", {"name": "csrf-token"})
    if not token_input or not token_input.get("content"):
        print("Could not find CSRF token")
        return []
    csrf_token = token_input["content"]

    headers = {
        "x-csrf-token": csrf_token,
        "User-Agent": "Mozilla/5.0",
        "Referer": f"https://chartink.com/screener/{screener_name}"
    }

    payload = {
        "scan_clause": scan_clause
    }

    try:
        response = session.post("https://chartink.com/screener/process", data=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        stocks = [row["nsecode"] for row in data["data"]]
        print(f"Stocks from screener: ")
        # for stock in stocks:
            # print(stock)
        return stocks
    except Exception as e:
        print("Failed to fetch screener data:", e)
        return []

# Example usage:
# stocks = fetch_chartink_screener("bittu-daily-trading")
# print(stocks)
