from kiteconnect import KiteConnect

# Initialize KiteConnect with API key
kite = KiteConnect(api_key="j1z0yebn5wxfo74p")

from kiteconnect import KiteConnect

api_key = "j1z0yebn5wxfo74p"
api_secret = "po7qh93sse3jnjfmuyy4vdsjtpkcwobk"
request_token = "wwSl2Y0nseaIOpvRlvvBEMf190ap9MNw"

# kite = KiteConnect(api_key=api_key)
# data = kite.generate_session(request_token=request_token, api_secret=api_secret)

# access_token = data["access_token"]
# print("Access token:", access_token)
kite = KiteConnect(api_key=api_key)
with open("../../token/access_token.txt", "r") as f:
    kite.set_access_token(f.read().strip())

# Save access token to use in your scripts
# kite.set_access_token(access_token)

# Set your access token (you must generate this after login each day)
# kite.set_access_token("po7qh93sse3jnjfmuyy4vdsjtpkcwobk")

# Define order parameters
def place_market_order(tradingsymbol, quantity, transaction_type):
    order_id = kite.place_order(
        variety=kite.VARIETY_REGULAR,
        exchange=kite.EXCHANGE_NSE,
        tradingsymbol=tradingsymbol,
        transaction_type=transaction_type,  # kite.TRANSACTION_TYPE_BUY or SELL
        quantity=quantity,
        order_type=kite.ORDER_TYPE_MARKET,
        product=kite.PRODUCT_CNC  # or kite.PRODUCT_MIS for intraday
    )
    print(f"Order placed successfully. Order ID: {order_id}")

# Example: Buy 1 share of INFY at market price
place_market_order("VIRINCHI", 1, kite.TRANSACTION_TYPE_BUY)

# api-key: j1z0yebn5wxfo74p
# api-secret: po7qh93sse3jnjfmuyy4vdsjtpkcwobk
# https://kite.zerodha.com/connect/login?v=3&api_key=j1z0yebn5wxfo74p
# Example: Sell 1 share of INFY at market price
# place_market_order("INFY", 1, kite.TRANSACTION_TYPE_SELL)
