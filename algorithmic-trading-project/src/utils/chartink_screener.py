import requests
from bs4 import BeautifulSoup
import pandas as pd

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
scan_clause = "( {cash} ( latest close >= latest ema( latest close , 26 ) and latest close >= latest ema( latest close , 13 ) and latest close >= latest ema( latest close , 5 ) and latest rsi( 14 ) >= 60 and weekly macd line( 26 , 13 , 5 ) >= 0 and latest adx di positive( 13 ) > latest adx di negative( 13 ) and( {cash} ( latest adx( 13 ) > 12 or latest adx( 13 ) >= 1 day ago adx( 13 ) ) ) and( {cash} ( latest upper bollinger band( 20 , 2 ) < latest close and latest close > 1 day ago close and 1 day ago close > 2 days ago close ) ) and latest volume >= latest sma( latest volume , 13 ) and market cap >= 5000 ) ) "
# scan_clause = '''{
#     "filters":[
#         {"left":{"indicator":"latest close"},"operation":">","right":{"indicator":"ema","params":[5]}},
#         {"left":{"indicator":"latest close"},"operation":">","right":{"indicator":"ema","params":[13]}},
#         {"left":{"indicator":"latest close"},"operation":">","right":{"indicator":"ema","params":[26]}},
#         {"left":{"indicator":"rsi","params":[14]},"operation":">","right":{"value":50}},
#         {"left":{"indicator":"macd line weekly"},"operation":">","right":{"indicator":"macd signal weekly"}},
#         {"left":{"indicator":"adx +di"},"operation":">","right":{"indicator":"adx -di"}},
#         {"left":{"indicator":"adx"},"operation":">","right":{"value":30}},
#         {"left":{"indicator":"upper bollinger band"},"operation":">","right":{"indicator":"latest close"}},
#         {"left":{"indicator":"latest close"},"operation":">","right":{"indicator":"1 day ago close"}},
#         {"left":{"indicator":"latest volume"},"operation":">","right":{"indicator":"sma volume","params":[20]}}
#     ],
#     "sort":{"sort_on":"volume","order":"desc"}
# }'''

# Run it
fetch_chartink_screener(scan_clause)
