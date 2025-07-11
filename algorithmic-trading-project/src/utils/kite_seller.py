from kiteconnect import KiteConnect, KiteTicker
# from kite_login_generator import get_kite_client

api_key = "j1z0yebn5wxfo74p"
api_secret = "po7qh93sse3jnjfmuyy4vdsjtpkcwobk"
request_token = "ZUOkitrTrYZmx8R1oyFDB0N1N3W26RC3"

# kite = KiteConnect(api_key=api_key)
# data = kite.generate_session(request_token=request_token, api_secret=api_secret)

# access_token = data["access_token"]
# # Step 1: Setup
# kite = KiteConnect(api_key=api_key)
# kite.set_access_token(access_token)  # Ensure you have generated this for the day

# kite = get_kite_client()
# from kiteconnect import KiteConnect

# Initialize Kite
kite = KiteConnect(api_key=api_key)
with open("../../token/access_token.txt", "r") as f:
    kite.set_access_token(f.read().strip())

# Get all holdings (CNC)
def get_holdings():
    return {h['tradingsymbol']: h for h in kite.holdings()}

# Get all intraday positions (MIS)
def get_mis_positions():
    positions = kite.positions()
    return {p['tradingsymbol']: p for p in positions['day'] if p['product'] == 'MIS' and p['quantity'] > 0}

# Sell logic
def sell_stock(tradingsymbol, quantity=None, sell_all=False):
    holdings = get_holdings()
    mis_positions = get_mis_positions()

    # Check for holding
    holding_qty = holdings.get(tradingsymbol, {}).get('quantity', 0)

    # Check for MIS position
    mis_qty = mis_positions.get(tradingsymbol, {}).get('quantity', 0)

    total_available = holding_qty + mis_qty
    if total_available == 0:
        print(f"❌ You do not hold or have any MIS position in {tradingsymbol}")
        return

    # Determine total quantity to sell
    sell_qty = total_available if sell_all else quantity

    if sell_qty is None or sell_qty <= 0 or sell_qty > total_available:
        print(f"❌ Invalid quantity. You can sell up to {total_available} shares of {tradingsymbol}")
        return

    qty_left_to_sell = sell_qty

    # Step 1: Sell from MIS first if available
    if mis_qty > 0:
        qty = min(mis_qty, qty_left_to_sell)
        kite.place_order(
            variety=kite.VARIETY_REGULAR,
            exchange=kite.EXCHANGE_NSE,
            tradingsymbol=tradingsymbol,
            transaction_type=kite.TRANSACTION_TYPE_SELL,
            quantity=qty,
            order_type=kite.ORDER_TYPE_MARKET,
            product=kite.PRODUCT_MIS
        )
        print(f"✅ MIS sell order placed for {qty} shares of {tradingsymbol}")
        qty_left_to_sell -= qty

    # Step 2: Sell remaining from CNC (if needed)
    if qty_left_to_sell > 0 and holding_qty > 0:
        qty = min(holding_qty, qty_left_to_sell)
        kite.place_order(
            variety=kite.VARIETY_REGULAR,
            exchange=kite.EXCHANGE_NSE,
            tradingsymbol=tradingsymbol,
            transaction_type=kite.TRANSACTION_TYPE_SELL,
            quantity=qty,
            order_type=kite.ORDER_TYPE_MARKET,
            product=kite.PRODUCT_CNC
        )
        print(f"✅ CNC sell order placed for {qty} shares of {tradingsymbol}")
        qty_left_to_sell -= qty

    if qty_left_to_sell > 0:
        print(f"⚠️ {qty_left_to_sell} shares not sold due to insufficient quantity in both MIS and CNC")

# 🧪 Examples:
sell_stock("CSBBANK", quantity=1)       # Sell 3 shares from MIS/CNC
# sell_stock("ANANDRATHI", sell_all=True)        # Sell all available (MIS + CNC)

#############################################################################
# # Step 2: Function to get holdings
# def get_current_holdings():
#     holdings = kite.holdings()
#     return {h['tradingsymbol']: h for h in holdings}

# # Step 3: Function to sell holding
# def sell_holding(tradingsymbol, quantity=None, sell_all=False):
#     holdings = get_current_holdings()

#     # Check if stock is held
#     if tradingsymbol not in holdings:
#         print(f" You do not hold any shares of {tradingsymbol}")
#         return

#     stock = holdings[tradingsymbol]
#     available_qty = stock['quantity']

#     # Determine quantity to sell
#     if sell_all:
#         sell_qty = available_qty
#     else:
#         if quantity is None or quantity > available_qty:
#             print(f" Invalid quantity. You hold only {available_qty} shares.")
#             return
#         sell_qty = quantity

#     # Place sell order
#     try:
#         order_id = kite.place_order(
#             variety=kite.VARIETY_REGULAR,
#             exchange=kite.EXCHANGE_NSE,
#             tradingsymbol=tradingsymbol,
#             transaction_type=kite.TRANSACTION_TYPE_SELL,
#             quantity=sell_qty,
#             order_type=kite.ORDER_TYPE_MARKET,
#             product=kite.PRODUCT_CNC  # CNC for delivery-based holdings
#         )
#         print(f" Sell order placed for {sell_qty} shares of {tradingsymbol}. Order ID: {order_id}")
#     except Exception as e:
#         print(f" Failed to place sell order: {e}")

# # 🔄 Examples

# # 1. Sell 2 shares of INFY
# # sell_holding("ANANDRATHI", quantity=1)

# # 2. Sell all shares of INFY
# sell_holding("ANANDRATHI", sell_all=True)
