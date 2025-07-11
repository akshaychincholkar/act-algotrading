def filter_ema(stock_data):
    """
    Filters stocks based on the condition that today's close is greater than the 5, 13, and 26 EMA values.
    
    Parameters:
    stock_data (DataFrame): A DataFrame containing stock data with 'Close', 'EMA5', 'EMA13', and 'EMA26' columns.
    
    Returns:
    bool: True if today's close is greater than all three EMAs, False otherwise.
    """
    today_close = stock_data['Close'].iloc[-1]
    ema_5 = stock_data['EMA5'].iloc[-1]
    ema_13 = stock_data['EMA13'].iloc[-1]
    ema_26 = stock_data['EMA26'].iloc[-1]
    
    return today_close > ema_5 and today_close > ema_13 and today_close > ema_26