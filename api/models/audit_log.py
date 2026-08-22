import json
import hashlib
from datetime import datetime, timezone
from typing import Optional, Any, Dict, TYPE_CHECKING
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON, event
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models.base import Base

if TYPE_CHECKING:
    from api.models.asset import Asset

class AuditLog(Base):
    """
    Append-only tamper-evident audit trail table recording full decision lineage.
    Includes SHA-256 hash-chain verification and database-level immutability enforcement.
    """
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    input_data_snapshot: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    score_breakdown: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    explanation_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("explanations.id", ondelete="SET NULL"), nullable=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Tamper-Evident SHA-256 Hash Chain Columns
    previous_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="audit_logs")

    def calculate_entry_hash(self, prev_hash: Optional[str] = None) -> str:
        """
        Calculates SHA-256 hash chaining previous row hash + record content.
        Formula: SHA-256(prev_hash + asset_id + created_at + snapshot + breakdown)
        """
        p_hash = prev_hash or self.previous_hash or "GENESIS_HASH_CHAIN_0000000000000000000000000000000000000000000"
        snapshot_str = json.dumps(self.input_data_snapshot or {}, sort_keys=True)
        breakdown_str = json.dumps(self.score_breakdown or {}, sort_keys=True)
        created_str = self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else ""
        
        payload = f"{p_hash}:{self.asset_id}:{created_str}:{snapshot_str}:{breakdown_str}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

# Immutability Guard: Prevent UPDATE and DELETE operations at ORM/DB level
@event.listens_for(AuditLog, "before_update")
def block_audit_log_update(mapper, connection, target):
    raise PermissionError("AuditLog records are append-only and immutable. UPDATE operations are forbidden at database level.")

@event.listens_for(AuditLog, "before_delete")
def block_audit_log_delete(mapper, connection, target):
    raise PermissionError("AuditLog records are append-only and immutable. DELETE operations are forbidden at database level.")
