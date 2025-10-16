<<<<<<< HEAD
# aircraft-rul-predictor
AI-powered aircraft subsystem health monitoring dashboard using FastAPI, Scikit-learn, and React.
=======
#  Aircraft Subsystem Health Monitoring Dashboard

A full-stack predictive maintenance system that forecasts the **Remaining Useful Life (RUL)** of aircraft subsystems — **Engine**, **Hydraulics**, and **Landing Gear** — using machine learning models and a modern web dashboard.

Frontend: **React + Tailwind CSS (Vite)**  
Backend: **FastAPI (Python)**  
ML Models: **Scikit-learn**

---

##  Features

- Predicts **RUL (Remaining Useful Life)** for three subsystems:
  - Engine
  - Hydraulic system
  - Landing gear
- Smart auto-imputation of missing sensor values using feature statistics.
- Visual health indicators ( Optimal /  Monitor /  Critical).
- Correlation-based feature generation for hydraulics.
- Modular architecture for easy model replacement.
- Lightweight deployment ready for **Render**, **Railway**, or **Vercel**.

---

##  Tech Stack

###  Frontend
- React + TypeScript (Vite)
- Tailwind CSS
- ShadCN/UI components
- Lucide-React icons

###  Backend
- FastAPI (Python)
- Uvicorn ASGI server
- Pydantic (input validation)
- NumPy (numerical operations)
- Scikit-learn (ML model inference)
- JSON / Pathlib (config + data handling)

###  Machine Learning
- Pretrained models for each subsystem:
  - `engine.pkl`
  - `hydraulics.pkl`
  - `landing_gear.pkl`
- Feature normalization using `MinMaxScaler` / `StandardScaler`
- Smart imputations + scaling logic in `inference.py`


##  Getting Started

###  Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
# Activate virtual environment
venv\Scripts\activate  # (Windows)
# source venv/bin/activate  # (macOS/Linux)

pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

API runs at:  
http://127.0.0.1:5000

---

###  Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App runs at:  
http://127.0.0.1:8080

---

##  API Endpoints

###  Engine Prediction
**POST** `/predict/engine`
```json
{
  "op_setting_1": 0.0005,
  "op_setting_2": 0.0002,
  "op_setting_3": 100.0,
  "sensor_11": 47.9,
  "sensor_4": 1400.0,
  "sensor_12": 522.0
}
```
**Response**
```json
{
  "predicted_rul": 96.6,
  "model_version": "best_model_fd001"
}
```

---

###  Hydraulics Prediction
**POST** `/predict/hydraulics`
```json
{
  "PS6_mean": 3000,
  "PS5_mean": 2850,
  "CE_mean": 45,
  "TS4_mean": 135,
  "TS2_mean": 105,
  "TS1_mean": 98,
  "CP_mean": 200,
  "TS3_mean": 113
}
```
**Response**
```json
{
  "predicted_rul": 111.5,
  "model_version": "agg_best_model"
}
```

---

### Landing Gear Prediction
**POST** `/predict/landing-gear`
```json
{
  "load_during_landing": 215,
  "tire_pressure": 210,
  "speed_during_landing": 145
}
```
**Response**
```json
{
  "predicted_rul": 376.8,
  "model_version": "best_rul_model_top3"
}
```

---

##  Configuration Notes
- Place your `.pkl` model files and `feature_defaults.json` inside `backend/models/`.
- `requirements.txt` lists all backend dependencies.
- Hydraulics model expands limited inputs to 65 derived features automatically.
- All API responses include `predicted_rul` and model version metadata.

---

##  Deployment

You can deploy easily using:
- **Render.com** or **Railway.app** (for FastAPI)
- **Vercel** or **Netlify** (for frontend)

### Example Render Build Commands
**Build:**  
```
pip install -r requirements.txt
```
**Start:**  
```
uvicorn main:app --host 0.0.0.0 --port 10000
```

---

##  Output Zones

| Zone | Condition | Color | Recommended Action |
|------|------------|--------|--------------------|
|  Optimal | RUL ≥ 70% | Green | Normal operation |
|  Monitor | 40% ≤ RUL < 70% | Yellow | Schedule maintenance |
|  Critical | RUL < 40% | Red | Immediate service required |

---

##  Author
**Mihik Sarkar**  
[GitHub](https://github.com/Mihik04) • [LinkedIn](www.linkedin.com/in/mihik-sarkar-51b48b29a)

---

> _“Predicting tomorrow’s failures today — making maintenance smarter, not harder.”_
>>>>>>> e70a89b (Initial commit - Aircraft Subsystem RUL Prediction Dashboard)
