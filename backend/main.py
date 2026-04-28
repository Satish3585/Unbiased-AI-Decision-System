from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from bias_engine import compute_fairness_metrics, explain_bias, get_column_metadata
from fix_engine import apply_bias_fix

# Gemini API setup
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    gemini_available = False
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        gemini_available = True
except Exception:
    gemini_available = False
    gemini_model = None

app = FastAPI(title="Unbiased AI Decision System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Unbiased AI Decision System API is running"}

uploaded_data = {}

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        
        # Store original dataframe
        uploaded_data["original_df"] = df.copy()
        uploaded_data["current_df"] = df.copy()
        
        metadata = get_column_metadata(df)
        
        return {
            "columns": df.columns.tolist(),
            "rows": len(df),
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV: {str(e)}")

@app.post("/analyze")
async def analyze(target: str = Form(...), group: str = Form(...)):
    df = uploaded_data.get("current_df")
    if df is None:
        raise HTTPException(status_code=400, detail="No data uploaded")
    
    # Validation
    metadata = get_column_metadata(df)
    if target not in metadata or not metadata[target]["is_binary"]:
        raise HTTPException(status_code=400, detail=f"Target column '{target}' must be a binary decision column (e.g., approved/hired)")
    
    if group not in metadata or not metadata[group]["is_categorical"]:
        raise HTTPException(status_code=400, detail=f"Protected attribute '{group}' must be a categorical group (e.g., gender, race)")
    
    if metadata[group]["unique_count"] > 10:
        raise HTTPException(status_code=400, detail=f"Protected attribute '{group}' has too many unique values ({metadata[group]['unique_count']}). Must be ≤ 10 (e.g., gender, race, age group)")

    result = compute_fairness_metrics(df, target, group)
    result["explanation"] = explain_bias(result)
    return result

@app.post("/fix")
async def fix_bias(target: str = Form(...), group: str = Form(...)):
    df = uploaded_data.get("original_df")
    if df is None:
        raise HTTPException(status_code=400, detail="No data uploaded")
    
    # Validation
    metadata = get_column_metadata(df)
    if target not in metadata or not metadata[target]["is_binary"]:
        raise HTTPException(status_code=400, detail=f"Target column '{target}' must be a binary decision column (e.g., approved/hired)")
    
    if group not in metadata or not metadata[group]["is_categorical"]:
        raise HTTPException(status_code=400, detail=f"Protected attribute '{group}' must be a categorical group (e.g., gender, race)")
    
    if metadata[group]["unique_count"] > 10:
        raise HTTPException(status_code=400, detail=f"Protected attribute '{group}' has too many unique values ({metadata[group]['unique_count']}). Must be ≤ 10 (e.g., gender, race, age group)")
    
    # Compute BEFORE metrics
    before = compute_fairness_metrics(df, target, group)
    before["explanation"] = explain_bias(before)
    
    # Apply debiasing
    fixed_df = apply_bias_fix(df, target, group)
    
    # Compute AFTER metrics
    after = compute_fairness_metrics(fixed_df, target, group)
    after["explanation"] = explain_bias(after)
    
    # Calculate improvement as percentage points
    improvement = round(after["fairness_score"] - before["fairness_score"], 2)
    
    return {
        "before": before,
        "after": after,
        "improvement": improvement,
        "rows_before": len(df),
        "rows_after": len(fixed_df)
    }

@app.post("/explain")
async def explain_with_ai(target: str = Form(...), group: str = Form(...)):
    """
    Generate a detailed AI explanation of the bias fix using Gemini.
    """
    df = uploaded_data.get("original_df")
    if df is None:
        raise HTTPException(status_code=400, detail="No data uploaded")
    
    before = compute_fairness_metrics(df, target, group)
    fixed_df = apply_bias_fix(df, target, group)
    after = compute_fairness_metrics(fixed_df, target, group)
    
    group_rates_before = before["group_rates"]
    group_rates_after = after["group_rates"]
    
    # Build prompt for Gemini
    prompt = f"""You are an AI fairness expert. Explain the bias detected in a dataset and how it was fixed, in simple human-readable terms.

Dataset Analysis:
- Target column (decision): {target}
- Protected attribute (group): {group}

BEFORE fixing bias:
- Group approval rates: {group_rates_before}
- Fairness score: {before['fairness_score']:.1f}% (0-100 scale, higher is better)
- Bias gap: {before['bias_gap']:.1f} percentage points

AFTER fixing bias:
- Group approval rates: {group_rates_after}
- Fairness score: {after['fairness_score']:.1f}%
- Bias gap: {after['bias_gap']:.1f} percentage points

Improvement: {after['fairness_score'] - before['fairness_score']:.1f} percentage points

Please explain in 4-5 short paragraphs:
1. What bias existed and which group was disadvantaged.
2. Why this bias likely happened (data imbalance, historical patterns, etc.).
3. What was changed to fix it (resampling/balancing approach).
4. How fairness improved with specific numbers.
5. Practical recommendations to maintain fairness in the future.

Keep the tone professional, simple, and actionable. Use bullet points where helpful."""

    if gemini_available and gemini_model:
        try:
            response = gemini_model.generate_content(prompt)
            ai_text = response.text
        except Exception as e:
            ai_text = f"AI explanation unavailable: {str(e)}\n\n" + generate_fallback_explanation(before, after, group)
    else:
        ai_text = generate_fallback_explanation(before, after, group)
    
    return {
        "ai_explanation": ai_text,
        "before": before,
        "after": after,
        "gemini_used": gemini_available
    }

def generate_fallback_explanation(before, after, group):
    """Generate a fallback explanation when Gemini is not available."""
    sorted_before = sorted(before["group_rates"].items(), key=lambda x: x[1])
    lowest = sorted_before[0][0]
    highest = sorted_before[-1][0]
    
    return (
        f"**Bias Detected:** Group '{lowest}' had a significantly lower approval rate ({before['group_rates'][lowest]*100:.0f}%) "
        f"compared to '{highest}' ({before['group_rates'][highest]*100:.0f}%).\n\n"
        f"**Why it happened:** The dataset contained an imbalance where '{lowest}' had fewer positive outcomes, "
        f"which could reflect historical bias or underrepresentation in the training data.\n\n"
        f"**What was changed:** We applied resampling by duplicating positive samples from the disadvantaged group "
        f"until all groups achieved similar approval rates.\n\n"
        f"**Improvement:** Fairness score improved from {before['fairness_score']:.1f}% to {after['fairness_score']:.1f}% "
        f"(a gain of {after['fairness_score'] - before['fairness_score']:.1f} percentage points). "
        f"The bias gap shrank from {before['bias_gap']:.1f}% to {after['bias_gap']:.1f}%.\n\n"
        f"**Recommendations:**\n"
        f"- Continue monitoring group-level outcomes in production.\n"
        f"- Collect more diverse training data to prevent recurrence.\n"
        f"- Set up alerts when fairness score drops below 90%."
    )

@app.post("/reset")
async def reset_data():
    """Reset to original uploaded data."""
    original = uploaded_data.get("original_df")
    if original is not None:
        uploaded_data["current_df"] = original.copy()
        return {"success": True, "rows": len(original)}
    return {"error": "No data uploaded"}

