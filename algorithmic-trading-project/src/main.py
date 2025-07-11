# main.py

from utils.nse_data_fetcher import fetch_nse_data
from utils.stock_screener import StockScreener

def main():
    # Fetch stock data from NSE India
    stock_data = fetch_nse_data()

    # Initialize the stock screener
    screener = StockScreener(stock_data)

    # Apply filters
    filtered_stocks = screener.apply_filters()

    # Output the filtered stocks
    print("Filtered Stocks:")
    for stock in filtered_stocks:
        print(stock)

if __name__ == "__main__":
    main()