from datetime import datetime, timezone
from typing import Optional, Any, Dict
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from api.models.base import Base

class DatasetUpload(Base):
    """
    Tracks raw user file ingestion attempts (CSV, XLSX, PDF), validation status,
    and audit lineage.
    """
    __tablename__ = "dataset_uploads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    user_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False) # csv, xlsx, pdf
    row_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    validation_status: Mapped[str] = mapped_column(String(50), nullable=False, default="success") # success, failed, preview
    error_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
