from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models.base import Base

if TYPE_CHECKING:
    from api.models.asset import Asset

class AssetFeature(Base):
    """
    Computed per-asset feature vector populated by the ingestion pipeline.
    Serves as input features for Rule Engine & XGBoost Risk Classifier.
    """
    __tablename__ = "asset_features"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    days_since_last_maintenance: Mapped[float] = mapped_column(Float, nullable=False, default=180.0)
    failure_count_last_12_months: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    latest_inspection_severity: Mapped[str] = mapped_column(String(50), nullable=False, default="none")
    pct_sensor_readings_out_of_range: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    incident_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", backref="features", uselist=False)
