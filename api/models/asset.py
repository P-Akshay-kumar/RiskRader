from datetime import datetime, timezone
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models.base import Base

if TYPE_CHECKING:
    from api.models.risk_score import RiskScore
    from api.models.audit_log import AuditLog
    from api.models.alert import Alert

class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    asset_type: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    consequence_score: Mapped[int] = mapped_column(Integer, nullable=False, default=3) # 1-5 Scale
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    risk_scores: Mapped[List["RiskScore"]] = relationship("RiskScore", back_populates="asset", cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="asset", cascade="all, delete-orphan")
    alerts: Mapped[List["Alert"]] = relationship("Alert", back_populates="asset", cascade="all, delete-orphan")
