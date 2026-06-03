# Flask LSTM API - Nutrisi Harian MBG

API ini digunakan untuk melakukan inference model LSTM untuk prediksi nutrisi harian.

## Struktur Folder

```
├── model/
│   ├── lstm_model.pt          # Model PyTorch (.pt)
│   └── scaler_nutrisi.save     # Scaler untuk normalisasi (joblib)
├── flask_api/
│   ├── app.py                 # Flask application
│   ├── requirements.txt      # Python dependencies
│   └── run.bat               # Script untuk Windows
└── README.md
```

## Setup

### 1. Install Python Dependencies

```bash
cd flask_api
pip install -r requirements.txt
```

### 2. Jalankan Flask API

**Windows:**
```bash
run.bat
```

**Manual:**
```bash
python app.py
```

API akan berjalan di `http://localhost:5000`

## API Endpoints

### GET /health
Health check.

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "model_loaded": true,
  "scaler_loaded": true,
  "timestamp": "2026-06-02T10:00:00"
}
```

### POST /predict
Prediksi nutrisi untuk 1 hari berikutnya.

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      [75.0, 16.0, 19.0, 0.0, 545.0, 55.0, 15.0, 19.0, 0.0, 455.0],
      [85.0, 17.0, 16.0, 0.0, 595.0, 85.0, 17.0, 16.0, 0.0, 510.0],
      ... (7 entries)
    ]
  }'
```

Response:
```json
{
  "success": true,
  "prediction": {
    "Karbohidrat_Besar": 80.0,
    "Protein_Besar": 20.0,
    "Lemak_Besar": 18.0,
    "Serat_Besar": 7.8,
    "Energi_Besar": 550.0,
    "Karbohidrat_Kecil": 68.0,
    "Protein_Kecil": 20.0,
    "Lemak_Kecil": 18.0,
    "Serat_Kecil": 7.7,
    "Energi_Kecil": 465.0
  },
  "columns": [...]
}
```

### POST /predict-next
Prediksi untuk multiple hari (auto-skip weekend).

```bash
curl -X POST http://localhost:5000/predict-next \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-05-20",
    "days": 10,
    "data": [
      [75.0, 16.0, 19.0, 0.0, 545.0, 55.0, 15.0, 19.0, 0.0, 455.0],
      ... (7 entries)
    ]
  }'
```

Response:
```json
{
  "success": true,
  "predictions": [
    { "date": "2026-05-20", "Karbohidrat_Besar": 80.0, ... },
    { "date": "2026-05-21", "Karbohidrat_Besar": 82.0, ... },
    ...
  ],
  "days_requested": 10,
  "predictions_generated": 7
}
```

## Kolom Nutrisi

Urutan array untuk 10 fitur:

| Index | Kolom (snake_case) | Deskripsi |
|-------|---------------------|-----------|
| 0 | Karbohidrat_Besar | Karbohidrat Porsi Besar (g) |
| 1 | Protein_Besar | Protein Porsi Besar (g) |
| 2 | Lemak_Besar | Lemak Porsi Besar (g) |
| 3 | Serat_Besar | Serat Porsi Besar (g) |
| 4 | Energi_Besar | Energi Porsi Besar (kkal) |
| 5 | Karbohidrat_Kecil | Karbohidrat Porsi Kecil (g) |
| 6 | Protein_Kecil | Protein Porsi Kecil (g) |
| 7 | Lemak_Kecil | Lemak Porsi Kecil (g) |
| 8 | Serat_Kecil | Serat Porsi Kecil (g) |
| 9 | Energi_Kecil | Energi Porsi Kecil (kkal) |

## Troubleshooting

### Model tidak loaded
Pastikan path ke `model/lstm_model.pt` dan `model/scaler_nutrisi.save` benar.

### Error saat predict
Pastikan data yang dikirim adalah array 7x10 dengan nilai float.

### Port sudah digunakan
Ganti port di `app.py`:
```python
app.run(host="0.0.0.0", port=5001, debug=True)  # ganti 5001
```

Lalu update `FLASK_API_URL` di `src/app/api/lstm-predict/route.ts`.
