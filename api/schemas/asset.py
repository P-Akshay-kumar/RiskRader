from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class AssetBase(BaseModel):
    name: str = Field(..., description="Asset identifier or descriptive name", example="High-Pressure Catalytic Feed Pump")
    asset_type: str = Field(..., description="Equipment category", example="Pump")
    location: str = Field(..., description="Plant unit or deck location", example="Cracker Unit 3")
    consequence_score: int = Field(3, ge=1, le=5, description="Operational consequence score (1-5)")

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[str] = None
    location: Optional[str] = None
    consequence_score: Optional[int] = Field(None, ge=1, le=5)

class AssetResponse(AssetBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
