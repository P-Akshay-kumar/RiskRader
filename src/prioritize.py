import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def calculate_priority_score(fused_score: float, consequence_score: int) -> float:
    """
    Calculate operational priority score using Risk x Consequence matrix formula.
    
    Why:
    Priority Score = Fused Risk (0-100) * Operational Consequence (1-5).
    Focuses limited maintenance crews and inspectors on high-consequence critical assets
    where failure impact is severe (e.g. primary refinery pumps vs auxiliary fan).
    """
    f_score = float(fused_score) if fused_score is not None else 0.0
    c_score = int(consequence_score) if consequence_score is not None else 3
    c_score = max(1, min(5, c_score))

    priority_score = round(f_score * c_score, 2)
    return priority_score

def prioritize_assets(assets_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Rank assets by priority_score descending with deterministic tie-breaking.
    
    Why:
    Produces the primary inspection queue. Secondary sort breaks ties using fused_score,
    rule_score, and asset_id.
    """
    processed_assets = []

    for item in assets_data:
        asset_item = dict(item)
        fused = float(asset_item.get("fused_score", 0.0))
        consequence = int(asset_item.get("consequence_score", 3))
        
        p_score = calculate_priority_score(fused, consequence)
        asset_item["priority_score"] = p_score
        processed_assets.append(asset_item)

    # Sort descending by priority_score, then fused_score, then rule_score, then asset_id ascending
    sorted_assets = sorted(
        processed_assets,
        key=lambda x: (
            x.get("priority_score", 0.0),
            x.get("fused_score", 0.0),
            x.get("rule_score", 0.0),
            -x.get("asset_id", 0) # Negative for ascending asset_id order
        ),
        reverse=True
    )

    # Add 1-based rank position
    for idx, asset in enumerate(sorted_assets, 1):
        asset["rank"] = idx

    return sorted_assets
