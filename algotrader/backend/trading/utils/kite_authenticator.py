import datetime
from ..models import User, Authenticator

api_key = "j1z0yebn5wxfo74p"
api_secret = "po7qh93sse3jnjfmuyy4vdsjtpkcwobk"

def is_user_authenticated_today(user_id):
    today = datetime.date.today()
    try:
        auth = Authenticator.objects.get(user_id=user_id, date=today)
        return True
    except Authenticator.DoesNotExist:
        return False

def authenticate_and_create_user():
    # Dummy user data
    user, created = User.objects.get_or_create(
        email_id="dummyuser@example.com",
        defaults={
            "first_name": "Dummy",
            "last_name": "User",
            "phone_no": "9999999999",
            "broker_id": "DUMMYBROKER",
            "access_token": ""
        }
    )
    #TODO: http://localhost:5173/?action=login&type=login&status=success&request_token=ZJAO45lBioBh6pEculQFeRhP4XwETQwc
    # Check if already authenticated for today
    if is_user_authenticated_today(user.id):
        print("User already authenticated for today.")
        return user
    # Simulate Kite authentication (replace with actual API call)
    # Here, just set access_token to a dummy value
    kite_access_token = f"{api_key}:{api_secret}:dummy_token"
    user.access_token = kite_access_token
    user.save()
    # Create Authenticator entry for today
    Authenticator.objects.create(user=user, access_token=kite_access_token, date=datetime.date.today())
    print("User authenticated and Authenticator entry created.")
    return user

# Example usage:
if __name__ == "__main__":
    authenticate_and_create_user()
