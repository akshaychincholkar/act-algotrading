
import requests
from bs4 import BeautifulSoup
import re
from .chartink_scan_clause import open_chartink_browser_and_print_scan_clause


def fetch_chartink_screener(scan_clause):

    # Check if scan_clause is None, empty, or blank
    if scan_clause is None or (isinstance(scan_clause, str) and scan_clause.strip() == ""):
        # Simulate a 404 response by raising an exception
        from requests.exceptions import HTTPError
        raise HTTPError("404 Client Error: screener is not present. Please verify the screener name", response=None)

    # Step 1: Load the homepage to get the CSRF token
    session = requests.Session()
    homepage = session.get("https://chartink.com/")
    soup = BeautifulSoup(homepage.text, "html.parser")

    # token_input = soup.find("input", {"name": "_token"})
    token_input = soup.find("meta", {"name": "csrf-token"})["content"]
    if not token_input:
        print("Could not find CSRF token")
        return []

    # csrf_token = token_input["value"]

    headers = {
        "x-csrf-token": token_input,
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://chartink.com/screener/bittu-daily-trading"
    }

    payload = {
        # "_token": csrf_token,
        "scan_clause": scan_clause
    }

    try:
        response = session.post("https://chartink.com/screener/process", data=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        stocks = [row["nsecode"] for row in data["data"]]
        print(f"Stocks from screener: ")
        for stock in stocks:
            print(stock)
        return stocks
    except Exception as e:
        print("Failed to fetch screener data:", e)
        return []

# Your actual scan_clause goes here (must be copied from browser dev tools)
# scanner_name = "bittu-daily-trading"
# scan_clause = open_chartink_browser_and_print_scan_clause(scanner_name)

# Run it
# fetch_chartink_screener(scan_clause)
