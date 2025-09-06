from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import os
from io import StringIO

app = Flask(__name__, static_folder='../frontend/dist')
CORS(app)
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data')
DATA_FILE = os.path.join(DATA_PATH, 'sample_data.csv')
cache = {}

def load_data(path=DATA_FILE):
    df = pd.read_csv(path, parse_dates=['order_date'])
    df['revenue'] = df['units_sold'] * df['unit_price']
    df['month'] = df['order_date'].dt.to_period('M').dt.to_timestamp()
    return df

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'no file uploaded'}), 400
    f = request.files['file']
    s = f.read().decode('utf-8')
    df = pd.read_csv(StringIO(s), parse_dates=['order_date'])
    df['revenue'] = df['units_sold'] * df['unit_price']
    df['month'] = df['order_date'].dt.to_period('M').dt.to_timestamp()
    cache['df'] = df
    return jsonify({'status': 'ok', 'rows': len(df)})

@app.route('/api/kpis', methods=['GET'])
def kpis():
    df = cache.get('df')
    if df is None:
        df = load_data()
        cache['df'] = df
    total_revenue = float(df['revenue'].sum())
    total_orders = int(df['order_id'].nunique())
    total_units = int(df['units_sold'].sum())
    avg_order_value = float(total_revenue / total_orders) if total_orders else 0.0
    return jsonify({'total_revenue': total_revenue, 'total_orders': total_orders, 'total_units': total_units, 'avg_order_value': avg_order_value})

@app.route('/api/revenue_by_month', methods=['GET'])
def revenue_by_month():
    df = cache.get('df')
    if df is None:
        df = load_data()
        cache['df'] = df
    series = df.groupby('month')['revenue'].sum().reset_index()
    series['month'] = series['month'].dt.strftime('%Y-%m')
    return jsonify(series.to_dict(orient='records'))

@app.route('/api/revenue_by_region', methods=['GET'])
def revenue_by_region():
    df = cache.get('df')
    if df is None:
        df = load_data()
        cache['df'] = df
    series = df.groupby('region')['revenue'].sum().reset_index()
    return jsonify(series.to_dict(orient='records'))

@app.route('/api/top_products', methods=['GET'])
def top_products():
    df = cache.get('df')
    if df is None:
        df = load_data()
        cache['df'] = df
    series = df.groupby('product')['revenue'].sum().reset_index().sort_values('revenue', ascending=False).head(5)
    return jsonify(series.to_dict(orient='records'))

@app.route('/api/data', methods=['GET'])
def data_table():
    df = cache.get('df')
    if df is None:
        df = load_data()
        cache['df'] = df
    return df.to_dict(orient='records')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != '' and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)