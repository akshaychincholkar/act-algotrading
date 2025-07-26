from kiteconnect import KiteConnect
# Import Django models
from ..models.global_parameters import GlobalParameters
from ..models.user import User
from ..models.authenticator import Authenticator

def get_api_key(user_id):
    authenticator = Authenticator.objects.filter(user_id=user_id).first()
    return authenticator.api_key if authenticator else None

def get_access_token(user_id):
    authenticator = Authenticator.objects.filter(user_id=user_id).first()
    return authenticator.access_token if authenticator else None

def get_kite_client(user_id):
    api_key = get_api_key(user_id)
    access_token = get_access_token(user_id)
    if not api_key or not access_token:
        raise Exception("Missing API key or access token")
    kite = KiteConnect(api_key=api_key)
    kite.set_access_token(access_token)
    return kite

# Define order parameters
def place_market_order(user_id, tradingsymbol, quantity, transaction_type):
    kite = get_kite_client(user_id)
    # Accept string 'BUY' or 'SELL' and map to KiteConnect constants
    tx_type = kite.TRANSACTION_TYPE_BUY if str(transaction_type).upper() == "BUY" else kite.TRANSACTION_TYPE_SELL
    order_id = kite.place_order(
        variety=kite.VARIETY_REGULAR,
        exchange=kite.EXCHANGE_NSE,
        tradingsymbol=tradingsymbol,
        transaction_type=tx_type,
        quantity=quantity,
        order_type=kite.ORDER_TYPE_MARKET,
        product=kite.PRODUCT_CNC  # or kite.PRODUCT_MIS for intraday
    )
    print(f"Order placed successfully. Order ID: {order_id}")

# Example usage:
# place_market_order(user_id, "STARCEMENT", 1, KiteConnect.TRANSACTION_TYPE_BUY)