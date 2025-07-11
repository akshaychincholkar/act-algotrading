import os
from flask import Flask, request, jsonify
from kiteconnect import KiteConnect
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

TOKEN_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../token'))
os.makedirs(TOKEN_DIR, exist_ok=True)

@app.route('/generate-token', methods=['POST'])
def generate_token():
    try:
        data = request.json
        api_key = data['api_key']
        api_secret = data['api_secret']
        request_token = data['request_token']

        kite = KiteConnect(api_key=api_key)
        session_data = kite.generate_session(request_token, api_secret=api_secret)
        access_token = session_data["access_token"]

        # ✅ Save token to token/access_token.txt
        token_path = os.path.join(TOKEN_DIR, "access_token.txt")
        with open(token_path, "w") as f:
            f.write(access_token)

        return jsonify({"success": True, "access_token": access_token})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
