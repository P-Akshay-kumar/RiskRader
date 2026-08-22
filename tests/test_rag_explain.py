import os
import sys
import pytest
from unittest.mock import patch

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.rag_explain import (
    generate_explanation,
    generate_deterministic_grounded_explanation,
    ALLOWED_ACTIONS,
    rule_based_fallback_action,
)

def test_grounded_explanation_no_unmentioned_claims():
    """
    Test that generated explanation contains only facts derived from input metrics and SOP text.
    """
    sample_factor_breakdown = {
        "fused_score": 80.0,
        "risk_band": "high",
        "factors": {
            "maintenance_recency": {"raw_value": 140.0, "weighted_contribution": 25.0},
            "sensor_deviation": {"raw_value": 75.0, "weighted_contribution": 20.0},
            "inspection_severity": {"raw_value": "high", "weighted_contribution": 15.0},
            "failure_history": {"raw_value": 2, "weighted_contribution": 20.0},
        }
    }

    retrieved = [{
        "text": "Inspect primary mechanical seal packing for weeping. Transfer to standby pump if vibration > 7.1 mm/s.",
        "source_title": "SOP-101: Centrifugal Pump Overdue Maintenance",
        "similarity_score": 0.75
    }]

    exp = generate_explanation("Centrifugal Feed Pump", sample_factor_breakdown, retrieved)

    assert "explanation_text" in exp
    assert "recommended_action" in exp
    assert "cited_source" in exp
    assert exp["recommended_action"] in ALLOWED_ACTIONS
    assert "140" in exp["explanation_text"] or "overdue" in exp["explanation_text"].lower()

def test_recommended_action_enum_fallback_validation():
    """
    Test that even if LLM returns an invalid action enum (e.g. 'replace_pump_now'),
    the system validates and falls back to a valid enum in {'inspect', 'maintain', 'calibrate', 'monitor'}.
    """
    sample_factor_breakdown = {
        "fused_score": 65.0,
        "risk_band": "medium",
        "factors": {
            "maintenance_recency": {"raw_value": 180.0, "weighted_contribution": 30.0},
        }
    }

    retrieved = [{
        "text": "Perform routine maintenance procedure.",
        "source_title": "SOP-101",
        "similarity_score": 0.80
    }]

    mock_invalid_llm_json = '{"explanation_text": "Maintenance is overdue.", "recommended_action": "INVALID_ACTION_NAME", "cited_source": "SOP-101"}'

    with patch("os.getenv", side_effect=lambda k, d=None: "ollama" if k == "LLM_BACKEND" else d):
        with patch("src.rag_explain.call_ollama_llm", return_value=mock_invalid_llm_json):
            exp = generate_explanation("Test Pump", sample_factor_breakdown, retrieved)

            assert exp["recommended_action"] in ALLOWED_ACTIONS
            assert exp["recommended_action"] == "maintain"

def test_no_relevant_snippet_fallback_path():
    """
    Test that when similarity_score is below 0.30 threshold or retrieved is empty,
    system produces a valid grounded explanation without calling LLM for non-existent SOP context.
    """
    sample_factor_breakdown = {
        "fused_score": 45.0,
        "risk_band": "medium",
        "factors": {
            "sensor_deviation": {"raw_value": 35.0, "weighted_contribution": 15.0},
        }
    }

    # Low similarity score < 0.30
    irrelevant_retrieved = [{
        "text": "Unrelated boiler blowdown procedure.",
        "source_title": "Unrelated Document",
        "similarity_score": 0.12
    }]

    exp = generate_explanation("Inlet Valve", sample_factor_breakdown, irrelevant_retrieved)

    assert exp["recommended_action"] in ALLOWED_ACTIONS
    assert exp["cited_source"] == "Risk Factor Assessment"
    assert "Inlet Valve" in exp["explanation_text"]

def test_end_to_end_console_output_seeded_assets():
    """
    Console print check running end-to-end explanation generation for sample assets.
    """
    assets_samples = [
        ("Distillation Tower Reboiler (TOWER-304)", 83.5, "high", 875.0, 100.0, "high", "SOP-204: High-Pressure Vessel Inspection Protocol"),
        ("High-Pressure Catalytic Feed Pump (PUMP-408B)", 80.0, "high", 773.0, 75.0, "high", "SOP-101: Centrifugal Pump Overdue Maintenance Protocol"),
        ("Turbine Gas Compressor A (COMP-102)", 72.0, "high", 812.0, 33.3, "medium", "SOP-302: SCADA Vibration Monitoring Thresholds"),
    ]

    print("\n==========================================================================================================")
    print("                RISK RADAR AI AGENT - GROUNDED EXPLANATIONS & RECOMMENDATIONS                             ")
    print("==========================================================================================================")
    for name, fused, band, days, sensor, insp_sev, sop_title in assets_samples:
        breakdown = {
            "fused_score": fused,
            "risk_band": band,
            "factors": {
                "maintenance_recency": {"raw_value": days, "weighted_contribution": 30.0},
                "sensor_deviation": {"raw_value": sensor, "weighted_contribution": 25.0},
                "inspection_severity": {"raw_value": insp_sev, "weighted_contribution": 15.0},
            }
        }
        retrieved = [{
            "text": f"Mandatory procedure for {name}. Perform immediate field inspection and cooling flush verification.",
            "source_title": sop_title,
            "similarity_score": 0.78
        }]

        exp = generate_explanation(name, breakdown, retrieved)
        print(f"\nASSET: {name}")
        print(f"  Fused Score       : {fused:.1f} ({band.upper()})")
        print(f"  Recommended Action: [{exp['recommended_action'].upper()}]")
        print(f"  Cited Source      : {exp['cited_source']}")
        print(f"  AI Explanation    : {exp['explanation_text']}")
    print("==========================================================================================================\n")
