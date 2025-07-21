import json
import re
import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
from chartink_scan_clause import open_chartink_browser_and_print_scan_clause
# --- NEW FUNCTION TO FETCH scan_clause BY SCREENER NAME ---
def get_scan_clause_by_name(scanner_name):
    """
    Fetch the scan_clause for a given Chartink scanner name using the /backtest/process API.
    Example: scanner_name = 'bittu-daily-trading'
    """
    session = requests.Session()
    screener_url = f"https://chartink.com/screener/{scanner_name}"
    resp = session.get(screener_url)
    if resp.status_code != 200:
        print(f"Failed to load screener page: {screener_url}")
        return None
    soup = BeautifulSoup(resp.text, "html.parser")
    # Try to extract scan_id from the page (used by Chartink internally)
    scan_id = None
    for script in soup.find_all("script"):
        if script.string and 'scan_id' in script.string:
            match = re.search(r'scan_id\s*:\s*(\d+)', script.string)
            if match:
                scan_id = match.group(1)
                break
    if not scan_id:
        # Try to extract from URL (if present)
        match = re.search(r'-([0-9]+)$', scanner_name)
        if match:
            scan_id = match.group(1)
    if not scan_id:
        print("Could not find scan_id for screener")
        return None
    # Get CSRF token
    homepage = session.get("https://chartink.com/")
    soup_home = BeautifulSoup(homepage.text, "html.parser")
    token_input = soup_home.find("meta", {"name": "csrf-token"})
    if not token_input:
        print("Could not find CSRF token")
        return None
    csrf_token = token_input["content"]
    headers = {
        "x-csrf-token": csrf_token,
        "User-Agent": "Mozilla/5.0",
        "Referer": screener_url
    }
    payload = {"scan_id": scan_id}
    try:
        # This endpoint returns scan_clause and other details
        r = session.post("https://chartink.com/backtest/process", data=payload, headers=headers)
        r.raise_for_status()
        data = r.json()
        if "scan_clause" in data:
            return data["scan_clause"]
        # Fallback: try to parse from HTML if not present
        for script in soup.find_all("script"):
            if script.string and "scan_clause" in script.string:
                match = re.search(r'scan_clause\s*:\s*"(.*?)"', script.string, re.DOTALL)
                if match:
                    scan_clause = match.group(1)
                    scan_clause = scan_clause.encode().decode('unicode_escape')
                    return scan_clause
    except Exception as e:
        print("Failed to fetch scan_clause:", e)
    return None


# def get_scan_clause_by_name(scanner_name):
#     """
#     Fetch the scan_clause for a given Chartink scanner name.
#     Example: scanner_name = 'bittu-daily-trading'
#     """
#     session = requests.Session()
#     url = f"https://chartink.com/screener/{scanner_name}"
#     resp = session.get(url)
#     soup = BeautifulSoup(resp.text, "html.parser")
#     # The scan_clause is embedded in a <script> tag as part of a JS variable
#     scripts = soup.find_all("script")
#     for script in scripts:
#         if script.string and "scan_clause" in script.string:
#             # Try to extract the scan_clause string
#             match = re.search(r'scan_clause\s*:\s*"(.*?)"', script.string, re.DOTALL)
#             if match:
#                 scan_clause = match.group(1)
#                 # Unescape any escaped quotes
#                 scan_clause = scan_clause.encode().decode('unicode_escape')
#                 return scan_clause
#     return None

# Example usage:
# clause = get_scan_clause_by_name("bittu-daily-trading")
# print(clause)

def fetch_chartink_screener(scan_clause):
#     url = "https://chartink.com/screener/process"

#     with requests.Session() as session:
#         raw_data = session.get(url)
#         soup = BeautifulSoup(raw_data.content, "lxml")
#         token_input = soup.find("meta", {"name": "csrf-token"})["content"]
#         header = { "x-csrf-token": token_input}
#         data = session.post(url, headers=header,data = scan_clause).json()
#         stock_list = pd.DataFrame(data["data"])
#         print(stock_list)

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
# scan_clause = "( {cash} ( latest close >= latest ema( latest close , 26 ) and latest close >= latest ema( latest close , 13 ) and latest close >= latest ema( latest close , 5 ) and latest rsi( 14 ) >= 60 and weekly macd line( 26 , 13 , 5 ) >= 0 and latest adx di positive( 13 ) > latest adx di negative( 13 ) and( {cash} ( latest adx( 13 ) > 12 or latest adx( 13 ) >= 1 day ago adx( 13 ) ) ) and( {cash} ( latest upper bollinger band( 20 , 2 ) < latest close and latest close > 1 day ago close and 1 day ago close > 2 days ago close ) ) and latest volume >= latest sma( latest volume , 13 ) and market cap >= 5000 ) ) "
# scanner_name = "bittu-daily-trading"
# scan_clause = open_chartink_browser_and_print_scan_clause(scanner_name)

# Run it
# fetch_chartink_screener(scan_clause)
