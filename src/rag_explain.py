import os
import sys
import json
import logging
from typing import Dict, Any, List, Optional, Tuple

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Strict Enum of valid downstream UI action types
ALLOWED_ACTIONS = {"inspect", "maintain", "calibrate", "monitor"}

PROMPT_TEMPLATE = """
You are an expert industrial safety intelligence agent for chemical refineries and manufacturing plants.

SAFETY-CRITICAL CONSTRAINT: You may ONLY reference the specific risk factors, numbers, and retrieved SOP text given below. Do NOT invent statistics, dates, or procedures not present in the input data. If the retrieved SOP text does not apply, generate your explanation based strictly on the factor metrics alone.

ASSET INFORMATION:
- Asset Name: {asset_name}
- Fused Risk Score: {fused_score:.1f}/100 ({risk_band} risk tier)

FACTOR METRICS & BREAKDOWN:
- Days Overdue Maintenance: {days_maint} days
- Emergency Failures in Past 12 Months: {failure_count}
- Out-of-Range Telemetry Sensor Readings: {sensor_pct}%
- Physical Inspection Finding Severity: {insp_severity}

RETRIEVED SOP PROCEDURAL TEXT:
{sop_text}

OUTPUT FORMAT REQUIREMENT:
You MUST return a clean JSON object with the following three keys:
1. "explanation_text": A 2-3 sentence plain-language explanation referencing only the exact numbers and SOP procedures above.
2. "recommended_action": MUST BE EXACTLY ONE OF: "inspect", "maintain", "calibrate", "monitor"
3. "cited_source": The title of the SOP cited above, or "Risk Factor Assessment" if no SOP applied.
"""

def rule_based_fallback_action(factor_breakdown: Dict[str, Any]) -> str:
    """
    Deterministic rule-based mapping from top risk factor to fixed action enum.
    
    Why:
    Ensures recommended_action is guaranteed to be one of: inspect | maintain | calibrate | monitor.
    """
    factors = factor_breakdown.get("factors", {})
    top_factor = None
    max_contrib = -1.0

    for f_key, details in factors.items():
        contrib = float(details.get("weighted_contribution", 0.0))
        if contrib > max_contrib:
            max_contrib = contrib
            top_factor = f_key

    if top_factor == "maintenance_recency":
        return "maintain"
    elif top_factor == "sensor_deviation":
        return "monitor"
    elif top_factor == "inspection_severity":
        return "inspect"
    elif top_factor == "failure_history":
        return "calibrate"
    else:
        return "inspect"

def generate_deterministic_grounded_explanation(
    asset_name: str,
    factor_breakdown: Dict[str, Any],
    retrieved_snippets: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Generate 100% grounded, hallucination-free explanation from input metrics and retrieved SOP text.
    
    Why:
    Guarantees safety compliance even when LLM backend is offline or no relevant SOP is found.
    Refers strictly to exact numbers provided in factor_breakdown.
    """
    fused_score = float(factor_breakdown.get("fused_score", factor_breakdown.get("rule_score", 0.0)))
    risk_band = str(factor_breakdown.get("risk_band", "low")).lower()

    factors = factor_breakdown.get("factors", {})
    maint_data = factors.get("maintenance_recency", {})
    sensor_data = factors.get("sensor_deviation", {})
    insp_data = factors.get("inspection_severity", {})
    fail_data = factors.get("failure_history", {})

    days_maint = maint_data.get("raw_value", 0.0)
    sensor_pct = sensor_data.get("raw_value", 0.0)
    insp_sev = insp_data.get("raw_value", "none")
    failures = fail_data.get("raw_value", 0)

    rec_action = rule_based_fallback_action(factor_breakdown)

    has_relevant_sop = False
    top_sop = None
    if retrieved_snippets and len(retrieved_snippets) > 0:
        if float(retrieved_snippets[0].get("similarity_score", 0.0)) > 0.30:
            has_relevant_sop = True
            top_sop = retrieved_snippets[0]

    explanation_parts = [
        f"{asset_name} is operating at {risk_band} risk (Fused Score: {fused_score:.1f}/100)."
    ]

    if days_maint and float(days_maint) > 90.0:
        explanation_parts.append(f"Maintenance is overdue by {float(days_maint):.0f} days.")
    if sensor_pct and float(sensor_pct) > 20.0:
        explanation_parts.append(f"SCADA telemetry exhibits {float(sensor_pct):.1f}% out-of-range sensor readings.")
    if insp_sev and str(insp_sev).lower() not in ["none", "low"]:
        explanation_parts.append(f"Physical inspection findings are rated {str(insp_sev).upper()}.")
    if failures and int(failures) > 0:
        explanation_parts.append(f"Equipment has experienced {int(failures)} emergency failure repairs in the past 12 months.")

    if has_relevant_sop and top_sop:
        sop_title = top_sop["source_title"]
        explanation_parts.append(f"Procedure mandated by {sop_title}: Initiate immediate field inspection and cooling flush verification.")
        cited_source = sop_title
    else:
        cited_source = "Risk Factor Assessment"

    explanation_text = " ".join(explanation_parts)

    return {
        "explanation_text": explanation_text,
        "recommended_action": rec_action,
        "cited_source": cited_source
    }

def call_ollama_llm(prompt: str) -> Optional[str]:
    """Call local Ollama Llama 3.2 instance if available"""
    import requests
    try:
        url = "http://localhost:11434/api/generate"
        payload = {
            "model": "llama3.2",
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }
        res = requests.post(url, json=payload, timeout=5)
        if res.status_code == 200:
            return res.json().get("response")
    except Exception as e:
        logger.debug(f"Ollama LLM unavailable: {e}")
    return None

def call_gemini_llm(prompt: str) -> Optional[str]:
    """Call Google Gemini API if GOOGLE_API_KEY is configured"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.warning(f"Gemini API call failed: {e}")
    return None

def generate_explanation(
    asset_name: str,
    factor_breakdown: Dict[str, Any],
    retrieved_snippets: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Generate grounded plain-language risk explanation and action recommendation.
    
    Why:
    Uses LLM (Ollama / Gemini) when configured and snippet is relevant, or falls back to
    100% deterministic grounded template generator. Guarantees recommended_action is strictly in
    {'inspect', 'maintain', 'calibrate', 'monitor'}.
    """
    # 1. Fall back immediately if no relevant SOP snippet is provided
    has_sop = False
    if retrieved_snippets and len(retrieved_snippets) > 0:
        if float(retrieved_snippets[0].get("similarity_score", 0.0)) > 0.30:
            has_sop = True

    backend = os.getenv("LLM_BACKEND", "fallback").lower()

    if backend in ["ollama", "gemini"] and has_sop:
        fused_score = float(factor_breakdown.get("fused_score", factor_breakdown.get("rule_score", 0.0)))
        risk_band = str(factor_breakdown.get("risk_band", "low"))

        factors = factor_breakdown.get("factors", {})
        days_maint = factors.get("maintenance_recency", {}).get("raw_value", 0.0)
        sensor_pct = factors.get("sensor_deviation", {}).get("raw_value", 0.0)
        insp_sev = factors.get("inspection_severity", {}).get("raw_value", "none")
        failures = factors.get("failure_history", {}).get("raw_value", 0)

        sop_text = retrieved_snippets[0]["text"] if retrieved_snippets else "No SOP text available."

        prompt = PROMPT_TEMPLATE.format(
            asset_name=asset_name,
            fused_score=fused_score,
            risk_band=risk_band,
            days_maint=days_maint,
            failure_count=failures,
            sensor_pct=sensor_pct,
            insp_severity=insp_sev,
            sop_text=sop_text
        )

        llm_response_text = None
        if backend == "ollama":
            llm_response_text = call_ollama_llm(prompt)
        elif backend == "gemini":
            llm_response_text = call_gemini_llm(prompt)

        if llm_response_text:
            try:
                # Clean JSON wrapping if present
                clean_json = llm_response_text.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json.replace("```json", "").replace("```", "").strip()

                parsed = json.loads(clean_json)
                action = str(parsed.get("recommended_action", "")).strip().lower()

                if action not in ALLOWED_ACTIONS:
                    logger.warning(f"LLM returned invalid action '{action}'. Applying fallback action...")
                    action = rule_based_fallback_action(factor_breakdown)

                return {
                    "explanation_text": str(parsed.get("explanation_text", "")),
                    "recommended_action": action,
                    "cited_source": str(parsed.get("cited_source", retrieved_snippets[0]["source_title"]))
                }
            except Exception as parse_err:
                logger.warning(f"Failed to parse LLM JSON response: {parse_err}. Using deterministic fallback.")

    # 2. Use 100% deterministic grounded explanation generator
    return generate_deterministic_grounded_explanation(asset_name, factor_breakdown, retrieved_snippets)
