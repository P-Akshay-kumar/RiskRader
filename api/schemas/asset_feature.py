from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AssetFeatureResponse(BaseModel):
    id: int
    asset_id: int
    days_since_last_maintenance: float
    failure_count_last_12_months: int
    latest_inspection_severity: str
    pct_sensor_readings_out_of_range: float
    incident_count: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IngestionRefreshResponse(BaseModel):
    status: str
    assets_processed: int
    message: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
