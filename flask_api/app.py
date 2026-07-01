
from flask import Flask, request, jsonify
import torch
import torch.nn as nn
import pickle
import numpy as np
import pandas as pd
import os

app = Flask(__name__)

class LSTMMBG(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size, dropout_rate=0.2):
        super(LSTMMBG, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.dropout = nn.Dropout(dropout_rate)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.dropout(out[:, -1, :])
        out = self.fc(out)
        return out

features = [
    'Karbohidrat Besar', 'Protein Besar', 'Lemak Besar', 'Serat Besar', 'Energi Besar',
    'Karbohidrat Kecil', 'Protein Kecil', 'Lemak Kecil', 'Serat Kecil', 'Energi Kecil'
]

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

torch.manual_seed(42)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(42)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

model_path = 'model_lstm_mbg.pt'
scaler_path = 'scaler_mbg.pkl'

model = LSTMMBG(input_size=10, hidden_size=50, num_layers=1, output_size=10).to(device)
scaler = None

if os.path.exists(model_path) and os.path.exists(scaler_path):
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval() 
    
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    print("[INFO] Model (.pt) dan Scaler (.pkl) berhasil dimuat.")
else:
    print(f"[WARNING] Pastikan file {model_path} dan {scaler_path} berada di folder yang sama!")

@app.route('/predict_daily', methods=['GET'])
def predict_daily():
    if scaler is None:
        return jsonify({"error": "Model atau Scaler belum dimuat di server."}), 500

    try:
        # Reset seed untuk konsistensi
        torch.manual_seed(42)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(42)

        csv_path = 'MBG Historis Latest 2.csv'
        if not os.path.exists(csv_path):
            return jsonify({"error": f"File {csv_path} tidak ditemukan"}), 404
            
        df = pd.read_csv(csv_path)
        df['Tanggal'] = pd.to_datetime(df['Tanggal'])
        df = df.sort_values('Tanggal').reset_index(drop=True)
        
        last_7_days_df = df.tail(7)
        if len(last_7_days_df) < 7:
            return jsonify({"error": "Data historis kurang dari 7 hari."}), 400
            
        history_np = last_7_days_df[features].values
        history_scaled = scaler.transform(history_np)
        history_tensor = torch.tensor(history_scaled, dtype=torch.float32).unsqueeze(0).to(device)
        
        with torch.no_grad():
            pred_scaled = model(history_tensor).cpu().numpy()
            
        pred_actual = scaler.inverse_transform(pred_scaled)
        result = {features[i]: round(float(pred_actual[0][i]), 2) for i in range(len(features))}
        
        return jsonify({
            "status": "success",
            "message": "Prediksi hari berikutnya berhasil.",
            "data_terakhir_yang_digunakan": str(last_7_days_df['Tanggal'].iloc[-1].date()),
            "prediksi_nutrisi": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict_custom', methods=['POST'])
def predict_custom():
    if scaler is None:
        return jsonify({"error": "Model atau Scaler belum dimuat di server."}), 500

    try:
        # Reset seed untuk konsistensi
        torch.manual_seed(42)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(42)

        data = request.get_json()
        history = data.get('history')
        
        if not history or len(history) != 7 or len(history[0]) != 10:
            return jsonify({"error": "Dibutuhkan array 2D dengan dimensi 7 hari x 10 fitur."}), 400
            
        history_np = np.array(history)
        history_scaled = scaler.transform(history_np)
        history_tensor = torch.tensor(history_scaled, dtype=torch.float32).unsqueeze(0).to(device)
        
        with torch.no_grad():
            pred_scaled = model(history_tensor).cpu().numpy()
            
        pred_actual = scaler.inverse_transform(pred_scaled)
        result = {features[i]: round(float(pred_actual[0][i]), 2) for i in range(len(features))}
        
        return jsonify({
            "status": "success",
            "prediksi_nutrisi": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
