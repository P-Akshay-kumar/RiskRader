import os
import sys
import pytest

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.prioritize import calculate_priority_score, prioritize_assets

def test_calculate_priority_score():
    """
    Test Priority Score calculation = Fused Score * Consequence Score (1-5).
    """
    p_score = calculate_priority_score(fused_score=80.0, consequence_score=5)
    assert p_score == 400.0 # 80 * 5

    p_score_low = calculate_priority_score(fused_score=30.0, consequence_score=2)
    assert p_score_low == 60.0 # 30 * 2

def test_prioritization_ordering():
    """
    Test ordering of hand-crafted assets by Priority Score descending:
    - Asset A: Fused = 60, Consequence = 5 -> Priority = 300
    - Asset B: Fused = 90, Consequence = 2 -> Priority = 180
    - Asset C: Fused = 70, Consequence = 5 -> Priority = 350
    Expected Order: C (350), A (300), B (180).
    """
    mock_assets = [
        {"asset_id": 1, "asset_name": "Asset A", "fused_score": 60.0, "consequence_score": 5},
        {"asset_id": 2, "asset_name": "Asset B", "fused_score": 90.0, "consequence_score": 2},
        {"asset_id": 3, "asset_name": "Asset C", "fused_score": 70.0, "consequence_score": 5},
    ]

    ranked = prioritize_assets(mock_assets)

    assert len(ranked) == 3
    assert ranked[0]["asset_id"] == 3 # Priority 350.0 (Rank 1)
    assert ranked[0]["rank"] == 1
    assert ranked[1]["asset_id"] == 1 # Priority 300.0 (Rank 2)
    assert ranked[1]["rank"] == 2
    assert ranked[2]["asset_id"] == 2 # Priority 180.0 (Rank 3)
    assert ranked[2]["rank"] == 3

def test_prioritization_tie_breaking():
    """
    Test tie-breaking when two assets have identical Priority Scores:
    - Asset X: Priority = 200.0, Fused = 50.0, Rule = 60.0, asset_id = 10
    - Asset Y: Priority = 200.0, Fused = 50.0, Rule = 40.0, asset_id = 11
    Expected: Asset X first because Rule score 60.0 > 40.0.
    """
    mock_assets = [
        {"asset_id": 11, "asset_name": "Asset Y", "fused_score": 50.0, "rule_score": 40.0, "consequence_score": 4}, # Priority = 200.0
        {"asset_id": 10, "asset_name": "Asset X", "fused_score": 50.0, "rule_score": 60.0, "consequence_score": 4}, # Priority = 200.0
    ]

    ranked = prioritize_assets(mock_assets)

    assert ranked[0]["asset_id"] == 10
    assert ranked[1]["asset_id"] == 11
