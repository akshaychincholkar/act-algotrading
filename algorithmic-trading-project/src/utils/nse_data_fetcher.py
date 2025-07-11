def fetch_nse_data(stock_symbol):
    import yfinance as yf
    import pandas as pd

    # Fetch historical data for the stock from NSE
    data = yf.download(stock_symbol + '.NS', period='60d', interval='1d')
    
    # Ensure the data is in the correct format
    if data.empty:
        raise ValueError("No data fetched for the stock symbol: {}".format(stock_symbol))
    
    # Reset index to have 'Date' as a column
    data.reset_index(inplace=True)
    
    return data