# def screen_stocks(midcap_symbols):
#     qualified = []
#     for symbol in midcap_symbols:
#         try:
#             df = yf.download(symbol + ".NS", period="6mo", interval="1d")
#             df.dropna(inplace=True)
#             df["EMA_5"] = ta.ema(df["Close"], length=5)
#             df["EMA_13"] = ta.ema(df["Close"], length=13)
#             df["EMA_26"] = ta.ema(df["Close"], length=26)
#             df["RSI"] = ta.rsi(df["Close"], length=14)
#             df["ADX"] = ta.adx(df["High"], df["Low"], df["Close"])
#             bb = ta.bbands(df["Close"])
#             df = pd.concat([df, bb], axis=1)
#             weekly = yf.download(symbol + ".NS", period="6mo", interval="1wk")
#             macd = ta.macd(weekly["Close"])

#             if (
#                 df.iloc[-1]["Close"] > df.iloc[-1]["EMA_5"] > df.iloc[-1]["EMA_13"] > df.iloc[-1]["EMA_26"]
#                 and df.iloc[-1]["RSI"] > 50
#                 and macd.iloc[-1]["MACD_12_26_9"] > 0
#                 and df.iloc[-1]["ADX+DI_14"] > df.iloc[-1]["ADX-DI_14"]
#                 and df.iloc[-1]["ADX_14"] > 30
#                 and df.iloc[-1]["Close"] < df.iloc[-1]["BBU_20_2.0"]
#                 and df.iloc[-1]["Close"] > df.iloc[-2]["Close"]
#                 and df.iloc[-1]["Volume"] > df["Volume"].rolling(20).mean().iloc[-1]
#             ):
#                 qualified.append(symbol)
#         except Exception as e:
#             print(f"Error with {symbol}: {e}")

#     return qualified