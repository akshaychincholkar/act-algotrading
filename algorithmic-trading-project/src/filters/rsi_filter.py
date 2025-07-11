def filter_rsi(stock_data):
    """
    Filters stocks based on the RSI value.
    
    Parameters:
    stock_data (DataFrame): The stock data containing the RSI values.
    
    Returns:
    bool: True if the RSI is greater than 50, False otherwise.
    """
    rsi_value = stock_data['RSI'].iloc[-1]  # Get the latest RSI value
    return rsi_value > 50