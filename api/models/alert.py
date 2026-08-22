from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models.base import Base

if TYPE_CHECKING:
    from api.models.asset import Asset

class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_band: Mapped[str] = mapped_column(String(50), nullable=False, default="low")
    new_band: Mapped[str] = mapped_column(String(50), nullable=False, default="high")
    triggered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="alerts")
