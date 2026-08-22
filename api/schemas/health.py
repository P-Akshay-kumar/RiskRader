from datetime import datetime
from pydantic import BaseModel, ConfigDict

class HealthResponse(BaseModel):
    status: str
    database: str
    timestamp: datetime
    version: str

    model_config = ConfigDict(from_attributes=True)
