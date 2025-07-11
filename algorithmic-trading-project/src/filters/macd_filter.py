def filter_macd(stock_data):
    """
    Check if the MACD is positive on a weekly time frame.
    
    Parameters:
    stock_data (DataFrame): A DataFrame containing stock price data with a 'MACD' column.

    Returns:
    bool: True if MACD is positive, False otherwise.
    """
    # Calculate the MACD for the weekly time frame
    macd_positive = stock_data['MACD'].iloc[-1] > 0
    return macd_positive