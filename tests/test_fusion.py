import os
import sys
import pytest

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.fusion import fuse_scores

def test_fusion_agreeing_scores():
    """
    Test fusion of agreeing Rule Engine and ML scores (e.g. 60.0 & 64.0).
    Difference = 4.0 (< 25.0 threshold) -> needs_review = False.
    Weighted average = 0.5 * 60 + 0.5 * 64 = 62.0.
    """
    fused_score, fused_band, needs_review = fuse_scores(rule_score=60.0, ml_score=64.0)

    assert fused_score == 62.0
    assert fused_band == "medium"
    assert needs_review is False

def test_fusion_disagreeing_scores_triggers_flag():
    """
    Test fusion of widely disagreeing scores (e.g. Rule = 80.0, ML = 30.0).
    Difference = 50.0 (> 25.0 threshold) -> needs_review = True.
    Weighted average = 0.5 * 80 + 0.5 * 30 = 55.0.
    """
    fused_score, fused_band, needs_review = fuse_scores(rule_score=80.0, ml_score=30.0)

    assert fused_score == 55.0
    assert fused_band == "medium"
    assert needs_review is True

def test_fusion_custom_weights_and_threshold():
    """
    Test fusion with custom weights (0.7 / 0.3) and custom disagreement threshold (15.0).
    """
    fused_score, fused_band, needs_review = fuse_scores(
        rule_score=70.0,
        ml_score=50.0,
        weight_rule=0.70,
        weight_ml=0.30,
        threshold=15.0
    )

    # 0.7*70 + 0.3*50 = 49 + 15 = 64.0
    assert fused_score == 64.0
    assert fused_band == "medium"
    assert needs_review is True # Diff = 20.0 > 15.0
