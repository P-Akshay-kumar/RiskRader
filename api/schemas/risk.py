from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field

class ExplanationResponse(BaseModel):
    id: int
    risk_score_id: int
    explanation_text: str
    recommended_action: str
    retrieved_source_snippet: Optional[str] = None
    retrieved_source_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RiskScoreResponse(BaseModel):
    id: int
    asset_id: int
    rule_score: float
    ml_score: float
    fused_score: float
    risk_band: str
    computed_at: datetime
    explanation: Optional[ExplanationResponse] = None

    model_config = ConfigDict(from_attributes=True)

class RiskEvaluationRequest(BaseModel):
    asset_id: int
    vibration_mms: float = Field(2.5, description="Vibration telemetry (mm/s)")
    temperature_c: float = Field(65.0, description="Temperature sensor (°C)")
    days_overdue: int = Field(0, description="Days since last service audit")
    inspection_condition: str = Field("Normal", description="Inspection finding: Normal, Minor Abnormality, Severe Defect")
    consequence_score: Optional[int] = Field(None, ge=1, le=5)
