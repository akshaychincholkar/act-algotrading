def calculate_ema(prices, period):
    return prices.ewm(span=period, adjust=False).mean()

def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(prices, short_window=12, long_window=26, signal_window=9):
    ema_short = calculate_ema(prices, short_window)
    ema_long = calculate_ema(prices, long_window)
    macd = ema_short - ema_long
    signal = calculate_ema(macd, signal_window)
    return macd, signal

def calculate_adx(high, low, close, period=14):
    tr = pd.concat([
        high - low,
        (high - close.shift()).abs(),
        (low - close.shift()).abs()
    ], axis=1).max(axis=1)
    
    atr = tr.rolling(window=period).mean()
    
    plus_dm = high.diff().where(lambda x: (x > 0) & (x > low.diff(), 0)).fillna(0)
    minus_dm = -low.diff().where(lambda x: (x < 0) & (x > high.diff(), 0)).fillna(0)
    
    plus_di = 100 * (plus_dm.rolling(window=period).sum() / atr)
    minus_di = 100 * (minus_dm.rolling(window=period).sum() / atr)
    
    adx = (abs(plus_di - minus_di) / (plus_di + minus_di)).rolling(window=period).mean() * 100
    return adx

def calculate_bollinger_bands(prices, window=20, num_std_dev=2):
    rolling_mean = prices.rolling(window=window).mean()
    rolling_std = prices.rolling(window=window).std()
    upper_band = rolling_mean + (rolling_std * num_std_dev)
    lower_band = rolling_mean - (rolling_std * num_std_dev)
    return upper_band, lower_band

def calculate_average_volume(volume, period=20):
    return volume.rolling(window=period).mean()