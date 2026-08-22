from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from api.models.base import Base

class AuthEvent(Base):
    """
    Immutable identity and session security log table.
    Tracks login, logout, role changes, overrides, and access denial events.
    """
    __tablename__ = "auth_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    user_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # login_success, login_failed, logout, role_change, override, access_denied
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
