from flask import Flask, request, jsonify
from kiteconnect import KiteConnect
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

EXCEL_PATH = os.path.abspath("../Stocks.xlsx")

@app.route('/api/summary', methods=['GET'])
def get_summary():
    df = pd.read_excel(EXCEL_PATH, sheet_name="B2(IND)", header=None)
    summary = df.iloc[1:10, 0:3].dropna().values.tolist()
    summary_data = [
        {"name": row[0], "value": row[1], "unit": row[2]} for row in summary if pd.notna(row[0])
    ]
    return jsonify(summary_data)

@app.route('/api/projection', methods=['GET'])
def get_projection():
    df = pd.read_excel(EXCEL_PATH, sheet_name="B2(IND)", header=None)
    projection = df.iloc[14:, 5:11]
    projection.columns = ['expected', 'monthlyPercent', 'months', 'actualGain', 'actualPercent', 'added']
    projection = projection.dropna(subset=['expected'])
    projection = projection.fillna({'added': 0})
    return jsonify(projection.to_dict(orient="records"))

if __name__ == '__main__':
    app.run(port=5000)
