import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from api.models.base import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    work_email = Column(String(255), nullable=False, index=True)
    phone_number = Column(String(50), nullable=True)
    company_name = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    facility_type = Column(String(100), nullable=False) # Manufacturing, Oil & Gas, Utilities, Chemical, Other
    company_size = Column(String(50), nullable=False)   # 1-50, 51-200, 201-1000, 1000+
    current_inspection_process = Column(String(100), nullable=False) # Manual/periodic, Some software, None
    primary_need = Column(Text, nullable=True)          # What would you want RiskRadar to help with first?
    source_page = Column(String(100), nullable=False, default="landing_page")
    ip_address = Column(String(50), nullable=True)
    submitted_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
