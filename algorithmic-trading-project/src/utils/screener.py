import pandas as pd
import yfinance as yf
import datetime
import numpy as np
# from nsepython import nse_eq
from ta.trend import EMAIndicator, ADXIndicator, MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands

# 1. Get list of NSE Midcap stocks (Example list - Replace with proper NSE scraping or API)
MIDCAP_STOCKS = [
    "PEL.NS", "CROMPTON.NS", "MOTHERSON.NS", "VOLTAS.NS", "TORNTPOWER.NS",  # Add more as required
]


def fetch_stock_data(ticker, period="6mo", interval="1d"):
    try:
        data = yf.download(ticker, period=period, interval=interval, progress=False)
        if data.empty:
            raise ValueError("No data found")
        data.dropna(inplace=True)
        return data
    except Exception as e:
        print(f"Failed to fetch data for {ticker}: {e}")
        return None



def apply_filters(ticker):
    data_daily = fetch_stock_data(ticker, "6mo", "1d")
    if data_daily is None or len(data_daily) < 30:
        return False

    data_weekly = fetch_stock_data(ticker, "1y", "1wk")
    if data_weekly is None or len(data_weekly) < 26:
        return False

    # Daily indicators
    close = data_daily['Close']
    volume = data_daily['Volume']
    
    ema5 = EMAIndicator(close, window=5).ema_indicator()
    ema13 = EMAIndicator(close, window=13).ema_indicator()
    ema26 = EMAIndicator(close, window=26).ema_indicator()
    rsi = RSIIndicator(close, window=14).rsi()
    adx = ADXIndicator(data_daily['High'], data_daily['Low'], close, window=14)
    bb = BollingerBands(close, window=20, window_dev=2)

    # Weekly MACD
    macd_weekly = MACD(data_weekly['Close'])

    latest_close = close.iloc[-1]
    prev_close = close.iloc[-2]
    avg_vol_20 = volume.rolling(window=20).mean().iloc[-1]
    latest_volume = volume.iloc[-1]

    # Filter checks
    filter1 = latest_close > ema5.iloc[-1] and latest_close > ema13.iloc[-1] and latest_close > ema26.iloc[-1]
    filter2 = rsi.iloc[-1] > 50
    filter3 = macd_weekly.macd_diff().iloc[-1] > 0
    filter4 = adx.adx_pos().iloc[-1] > adx.adx_neg().iloc[-1]
    filter5 = adx.adx().iloc[-1] > 30
    filter6 = bb.bollinger_hband().iloc[-1] > latest_close
    filter7 = latest_close > prev_close
    filter8 = latest_volume > avg_vol_20

    return all([filter1, filter2, filter3, filter4, filter5, filter6, filter7, filter8])


if __name__ == "__main__":
    filtered_stocks = []
    for stock in MIDCAP_STOCKS:
        print(f"Checking {stock}...")
        if apply_filters(stock):
            filtered_stocks.append(stock)

    print("\n--- Stocks Matching Criteria ---")
    for s in filtered_stocks:
        print(s)
