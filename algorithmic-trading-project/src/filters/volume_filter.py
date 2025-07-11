def filter_volume(stock_data):
    """
    Filters stocks based on volume criteria.
    
    Parameters:
    stock_data (DataFrame): A DataFrame containing stock data with 'Close' and 'Volume' columns.
    
    Returns:
    bool: True if today's close is greater than yesterday's close and volume is greater than the 20-day average volume, else False.
    """
    if stock_data.shape[0] < 21:
        return False  # Not enough data to calculate 20-day average

    today_close = stock_data['Close'].iloc[-1]
    yesterday_close = stock_data['Close'].iloc[-2]
    volume_today = stock_data['Volume'].iloc[-1]
    average_volume_20_days = stock_data['Volume'].iloc[-21:-1].mean()

    return (today_close > yesterday_close) and (volume_today > average_volume_20_days)