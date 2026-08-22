from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models.base import Base

if TYPE_CHECKING:
    from api.models.asset import Asset

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    ml_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    fused_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_band: Mapped[str] = mapped_column(String(50), nullable=False, default="low") # low, medium, high, critical
    user_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="risk_scores")
    explanation: Mapped[Optional["Explanation"]] = relationship("Explanation", back_populates="risk_score", uselist=False, cascade="all, delete-orphan")


class Explanation(Base):
    __tablename__ = "explanations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    risk_score_id: Mapped[int] = mapped_column(Integer, ForeignKey("risk_scores.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    explanation_text: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    retrieved_source_snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retrieved_source_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    risk_score: Mapped["RiskScore"] = relationship("RiskScore", back_populates="explanation")
