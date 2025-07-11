def filter_adx(data):
    """
    Filter function to check if the positive ADX is greater than the negative ADX
    and if the ADX is greater than 30.
    
    Parameters:
    data (DataFrame): DataFrame containing stock data with ADX values.
    
    Returns:
    bool: True if the conditions are met, False otherwise.
    """
    if 'adx_positive' in data.columns and 'adx_negative' in data.columns and 'adx' in data.columns:
        adx_positive = data['adx_positive'].iloc[-1]
        adx_negative = data['adx_negative'].iloc[-1]
        adx = data['adx'].iloc[-1]
        
        return adx_positive > adx_negative and adx > 30
    return False