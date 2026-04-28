import pandas as pd

def get_column_metadata(df: pd.DataFrame):
    """
    Analyze each column to determine if it's suitable as:
    - target: binary column (0/1, yes/no, true/false, pass/fail, etc.)
    - group: categorical column with limited unique values, excluding ID columns
    """
    metadata = {}
    total_rows = len(df)
    
    # Common ID-like patterns in column names
    id_patterns = ['id', '_id', 'num', '_no', 'code', 'index', 'serial', 'key', 'uuid', 'ref']
    
    for col in df.columns:
        unique_vals = df[col].dropna().unique()
        n_unique = len(unique_vals)
        dtype = str(df[col].dtype)
        col_lower = col.lower()
        
        # Check if column name looks like an ID column
        is_id_column = any(pattern in col_lower for pattern in id_patterns)
        
        # Binary = decision outcome column. Must have exactly 2 values that look like decisions.
        is_binary = False
        if n_unique == 2:
            # Numeric 0/1
            if pd.api.types.is_numeric_dtype(df[col]):
                sorted_vals = sorted([float(v) for v in unique_vals if pd.notna(v)])
                if sorted_vals == [0.0, 1.0]:
                    is_binary = True
            # String columns: only binary if values look like decisions (yes/no, pass/fail, etc.)
            else:
                lower_vals = set(str(v).lower().strip() for v in unique_vals if pd.notna(v))
                # Known binary/decision patterns
                binary_sets = [
                    {'yes', 'no'}, {'true', 'false'}, {'0', '1'},
                    {'approved', 'rejected'}, {'approved', 'not approved'},
                    {'hired', 'not hired'}, {'pass', 'fail'},
                    {'success', 'failure'}, {'success', 'fail'},
                    {'active', 'inactive'}, {'present', 'absent'},
                    {'win', 'loss'}, {'selected', 'not selected'},
                    {'accepted', 'declined'}, {'1.0', '0.0'},
                    {'eligible', 'not eligible'}, {'qualified', 'not qualified'},
                    {'positive', 'negative'}, {'good', 'bad'},
                    {'granted', 'denied'}, {'clear', 'not clear'},
                    {'completed', 'incomplete'}, {'done', 'not done'},
                ]
                if lower_vals in binary_sets:
                    is_binary = True
        
        # Categorical: limited unique values, not an ID column
        is_categorical = False
        if not is_id_column and n_unique >= 2:
            # Strict limit: max 10 unique values for protected attributes
            max_unique = min(10, max(5, int(total_rows * 0.05)))
            if n_unique <= max_unique:
                if pd.api.types.is_numeric_dtype(df[col]):
                    # Numeric columns: only categorical if they look like groups (small integers)
                    try:
                        if df[col].dropna().apply(lambda x: float(x).is_integer()).all() and n_unique <= 15:
                            is_categorical = True
                    except:
                        pass
                else:
                    is_categorical = True
        
        # Preview of unique values for display
        preview = [str(v) for v in unique_vals[:5]]
        if len(unique_vals) > 5:
            preview.append(f"+{len(unique_vals) - 5} more")
        
        metadata[col] = {
            "unique_count": n_unique,
            "unique_values": [str(v) for v in unique_vals[:10]],
            "unique_values_preview": preview,
            "is_binary": is_binary,
            "is_categorical": is_categorical,
            "is_id_column": is_id_column,
            "dtype": dtype
        }
    
    return metadata


def preprocess_target(df: pd.DataFrame, target: str):
    """
    Ensure target column is numeric (0/1).
    Converts 'yes'/'no', 'true'/'false', etc. to 1/0.
    """
    df = df.copy()
    
    # First, try direct numeric coercion (handles '1', '0', '1.0', '0.0')
    numeric_col = pd.to_numeric(df[target], errors='coerce')
    if numeric_col.notna().all():
        df[target] = numeric_col.astype(int)
        return df
    
    # Clean strings: strip whitespace, newlines, carriage returns
    cleaned = (df[target]
               .astype(str)
               .str.strip()
               .str.replace(r'[\r\n]', '', regex=True)
               .str.lower())
    
    lower_map = {
        'yes': 1, 'no': 0,
        'true': 1, 'false': 0,
        'approved': 1, 'rejected': 0,
        'hired': 1, 'not hired': 0,
        '1': 1, '0': 0,
        '1.0': 1, '0.0': 0
    }
    
    df[target] = cleaned.map(lower_map)
    return df

def compute_fairness_metrics(df: pd.DataFrame, target: str, group: str):
    df = preprocess_target(df, target)
    
    # Remove rows where target mapping failed (NaN)
    df = df.dropna(subset=[target])
    
    group_rates = df.groupby(group)[target].mean().to_dict()
    
    if len(group_rates) < 2:
        return {
            "group_rates": {str(k): round(float(v), 4) for k, v in group_rates.items()},
            "fairness_score": 100.0,
            "bias_gap": 0.0
        }
    
    rates = list(group_rates.values())
    min_rate = min(rates)
    max_rate = max(rates)
    
    # fairness_score = (min_group_rate / max_group_rate) * 100
    fairness_score = (min_rate / max_rate) * 100 if max_rate > 0 else 100.0
    bias_gap = (max_rate - min_rate) * 100
    
    return {
        "group_rates": {str(k): round(float(v), 4) for k, v in group_rates.items()},
        "fairness_score": round(float(fairness_score), 2),
        "bias_gap": round(float(bias_gap), 2)
    }


def explain_bias(metrics: dict):
    group_rates = metrics.get("group_rates", {})
    fairness_score = metrics.get("fairness_score", 0)
    bias_gap = metrics.get("bias_gap", 0)
    
    if fairness_score >= 95:
        return "No significant bias detected in selected dataset. The system appears fair across all groups."
    
    sorted_groups = sorted(group_rates.items(), key=lambda x: x[1])
    lowest_group = sorted_groups[0][0]
    highest_group = sorted_groups[-1][0]
    
    explanation = (
        f"Group '{lowest_group}' has a lower approval rate compared to '{highest_group}'. "
        f"The fairness score is {fairness_score:.1f}%, indicating a {bias_gap:.1f} percentage point gap. "
        f"This bias may lead to unfair outcomes for the '{lowest_group}' group in real-world decisions."
    )
    return explanation

