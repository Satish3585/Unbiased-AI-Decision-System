import pandas as pd
import numpy as np

def apply_bias_fix(df: pd.DataFrame, target: str, group: str):
    """
    Apply debiasing via resampling to balance approval rates across groups.
    Strategy: Use the overall dataset mean as the target balanced rate.
    For each group:
      - If rate < target: upsample positive samples (with replacement)
      - If rate > target: upsample negative samples (with replacement)
    This ensures all groups converge toward the same approval rate.
    """
    from bias_engine import preprocess_target
    df = preprocess_target(df, target)
    df = df.dropna(subset=[target])

    if len(df) == 0:
        return df

    group_rates = df.groupby(group)[target].mean()
    if group_rates.empty or len(group_rates) < 2:
        return df

    # Target balanced rate: overall dataset mean (fairer than using max)
    overall_rate = df[target].mean()

    # Edge case: if overall rate is 0 or 1, nothing to balance
    if overall_rate <= 0 or overall_rate >= 1:
        return df

    balanced_frames = []

    for g_name, group_df in df.groupby(group):
        current_rate = group_df[target].mean()
        positives = group_df[group_df[target] == 1]
        negatives = group_df[group_df[target] == 0]
        n_pos = len(positives)
        n_neg = len(negatives)
        n_total = len(group_df)

        if current_rate < overall_rate:
            # Need MORE positive samples to reach overall_rate
            # target_pos / (n_total + extra) = overall_rate
            # target_pos = overall_rate * (n_total + extra)
            # We add 'extra' positive samples:
            # (n_pos + extra) / (n_total + extra) = overall_rate
            # n_pos + extra = overall_rate * n_total + overall_rate * extra
            # n_pos + extra - overall_rate * extra = overall_rate * n_total
            # extra * (1 - overall_rate) = overall_rate * n_total - n_pos
            # extra = (overall_rate * n_total - n_pos) / (1 - overall_rate)

            needed_pos = overall_rate * n_total - n_pos
            if needed_pos > 0.5:
                extra = int(round(needed_pos / (1 - overall_rate)))
                extra = max(1, extra)
                if n_pos > 0:
                    upsampled = positives.sample(n=extra, replace=True, random_state=42)
                else:
                    # Group has 0 positives: borrow from overall positive pool
                    all_positives = df[df[target] == 1]
                    if len(all_positives) > 0:
                        upsampled = all_positives.sample(n=extra, replace=True, random_state=42)
                        upsampled[group] = g_name  # Assign to this group
                    else:
                        upsampled = pd.DataFrame()
                balanced_group = pd.concat([group_df, upsampled], ignore_index=True)
            else:
                balanced_group = group_df.copy()

        elif current_rate > overall_rate:
            # Need MORE negative samples to reach overall_rate
            # Similar math: we need to add negatives to dilute the rate
            # (n_pos) / (n_total + extra) = overall_rate
            # n_pos = overall_rate * (n_total + extra)
            # n_pos = overall_rate * n_total + overall_rate * extra
            # extra = (n_pos - overall_rate * n_total) / overall_rate

            needed_neg = n_pos - overall_rate * n_total
            if needed_neg > 0.5:
                extra = int(round(needed_neg / overall_rate))
                extra = max(1, extra)
                if n_neg > 0:
                    upsampled = negatives.sample(n=extra, replace=True, random_state=42)
                else:
                    # Group has 0 negatives: borrow from overall negative pool
                    all_negatives = df[df[target] == 0]
                    if len(all_negatives) > 0:
                        upsampled = all_negatives.sample(n=extra, replace=True, random_state=42)
                        upsampled[group] = g_name  # Assign to this group
                    else:
                        upsampled = pd.DataFrame()
                balanced_group = pd.concat([group_df, upsampled], ignore_index=True)
            else:
                balanced_group = group_df.copy()
        else:
            # Already at target rate
            balanced_group = group_df.copy()

        balanced_frames.append(balanced_group)

    if not balanced_frames:
        return df

    return pd.concat(balanced_frames, ignore_index=True)

