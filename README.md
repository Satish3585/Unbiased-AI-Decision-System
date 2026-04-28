# Unbiased AI Decision System

A full-stack web application for detecting and fixing bias in datasets.

## Project Structure

```
backend/
  main.py              # FastAPI application
  bias_engine.py       # Bias detection logic
  fix_engine.py        # Bias correction logic
  requirements.txt     # Python dependencies

frontend/
  src/
    App.js             # Main React component
    Upload.js          # File upload component
    Dashboard.js       # Results dashboard
    Chart.js           # Recharts bar chart
    api.js             # API client
    index.js           # React entry point
    index.css          # Tailwind imports
  public/
    index.html         # HTML template
  package.json         # Node dependencies
  tailwind.config.js   # Tailwind config
  postcss.config.js    # PostCSS config
```

## Running Instructions

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.

## How to Use

1. Upload the included `sample_data.csv` (or any CSV with a target and group column)
2. Select the **Target Column** (e.g., `approved`)
3. Select the **Protected Attribute** (e.g., `gender`)
4. Click **Analyze** to see fairness metrics and bias detection
5. Click **Fix Bias** to apply resampling and see before/after comparison

## Features

- Upload CSV datasets
- Automatic bias detection across groups
- Fairness score calculation
- Visual bar charts with Recharts
- Plain-English bias explanations
- Dataset balancing (resampling) to fix bias
- Before vs After comparison dashboard

