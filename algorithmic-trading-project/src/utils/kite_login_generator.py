from kiteconnect import KiteConnect

api_key = "j1z0yebn5wxfo74p"
api_secret = "po7qh93sse3jnjfmuyy4vdsjtpkcwobk"

kite = KiteConnect(api_key=api_key)
print("Login here and get request_token:", kite.login_url())

# Paste the request_token below after logging in manually
request_token = input("Enter your request_token: ")

# Generate access_token
data = kite.generate_session(request_token, api_secret=api_secret)
access_token = data["access_token"]

# Save to file
with open("access_token.txt", "w") as f:
    f.write(access_token)

print("✅ Access token saved to access_token.txt")


from kiteconnect import KiteConnect

def get_kite_client():
    kite = KiteConnect(api_key=api_key)
    with open("access_token.txt", "r") as f:
        access_token = f.read().strip()
    kite.set_access_token(access_token)
    return kite
