def filter_bollinger(stock_data):
    """
    This function checks if the upper Bollinger band is greater than today's close.
    
    Parameters:
    stock_data (DataFrame): A DataFrame containing stock data with 'Close' and 'Upper_Band' columns.
    
    Returns:
    bool: True if the upper Bollinger band is greater than today's close, False otherwise.
    """
    today_close = stock_data['Close'].iloc[-1]
    upper_band = stock_data['Upper_Band'].iloc[-1]
    
    return upper_band > today_close