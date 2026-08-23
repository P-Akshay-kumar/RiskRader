import os
import re
import time
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import urllib.request
import json

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.db import get_db
from api.auth import require_role, AuthenticatedUser
from api.models.lead import Lead

logger = logging.getLogger(__name__)

router = APIRouter(tags=["leads"])

# Simple in-memory IP rate limiting (max 5 requests per 10 minutes)
_IP_SUBMISSION_HISTORY: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW = 600 # 10 minutes
RATE_LIMIT_MAX_REQUESTS = 5

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

FACILITY_TYPES = ["Manufacturing", "Oil & Gas", "Utilities", "Chemical", "Other"]
COMPANY_SIZES = ["1-50", "51-200", "201-1000", "1000+"]
INSPECTION_PROCESSES = ["Manual/periodic", "Some software", "None"]

class LeadCreateRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="Visitor full name")
    work_email: str = Field(..., description="Visitor work email address")
    phone_number: Optional[str] = Field(None, description="Phone or WhatsApp number")
    company_name: str = Field(..., min_length=2, description="Company or organization name")
    job_title: str = Field(..., min_length=2, description="Job title or operational role")
    facility_type: str = Field(..., description="Facility sector type")
    company_size: str = Field(..., description="Company size range")
    current_inspection_process: str = Field(..., description="Current safety inspection workflow")
    primary_need: Optional[str] = Field(None, description="Free text primary need")
    source_page: Optional[str] = Field("landing_page", description="Source page URL or context")
    honeypot: Optional[str] = Field(None, description="Anti-spam hidden honeypot field")

def is_rate_limited(ip: str) -> bool:
    now = time.time()
    timestamps = _IP_SUBMISSION_HISTORY.get(ip, [])
    # Filter timestamps within window
    timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    _IP_SUBMISSION_HISTORY[ip] = timestamps
    return len(timestamps) >= RATE_LIMIT_MAX_REQUESTS

def record_ip_request(ip: str):
    now = time.time()
    timestamps = _IP_SUBMISSION_HISTORY.get(ip, [])
    timestamps.append(now)
    _IP_SUBMISSION_HISTORY[ip] = timestamps

async def send_resend_email_notification(lead_data: Dict[str, Any]):
    """
    Sends lead notification email via Resend API if RESEND_API_KEY is configured.
    Falls back to console log if key is unconfigured.
    """
    resend_api_key = os.getenv("RESEND_API_KEY")
    notification_email = os.getenv("NOTIFICATION_EMAIL", "sales@riskradar.io")

    if not resend_api_key:
        logger.info(f"[RESEND_MOCK] New Lead Notification for {lead_data['full_name']} ({lead_data['work_email']}) from {lead_data['company_name']}.")
        return

    try:
        url = "https://api.resend.com/emails"
        payload = {
            "from": "RiskRadar Leads <onboarding@resend.dev>",
            "to": [notification_email],
            "subject": f"🔥 New Lead Captured: {lead_data['full_name']} ({lead_data['company_name']})",
            "html": f"""
            <h2>New RiskRadar Demo Request Captured</h2>
            <p><b>Name:</b> {lead_data['full_name']}</p>
            <p><b>Work Email:</b> {lead_data['work_email']}</p>
            <p><b>Phone/WhatsApp:</b> {lead_data.get('phone_number') or 'N/A'}</p>
            <p><b>Company:</b> {lead_data['company_name']}</p>
            <p><b>Job Title:</b> {lead_data['job_title']}</p>
            <p><b>Facility Type:</b> {lead_data['facility_type']}</p>
            <p><b>Company Size:</b> {lead_data['company_size']}</p>
            <p><b>Current Process:</b> {lead_data['current_inspection_process']}</p>
            <p><b>Primary Need:</b> {lead_data.get('primary_need') or 'None specified'}</p>
            <p><b>Source:</b> {lead_data['source_page']}</p>
            """
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            },
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            logger.info(f"Resend email dispatched successfully (Status {resp.status})")
    except Exception as e:
        logger.error(f"Failed to send Resend email notification: {e}")

@router.post("/leads", status_code=status.HTTP_200_OK)
async def submit_lead_capture_form(
    req_data: LeadCreateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Public Lead Capture Form Endpoint.
    Enforces anti-bot honeypot protection, IP rate limiting, server-side email validation,
    stores lead in DB, sends Resend notification, and returns success response.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Anti-Bot Honeypot Protection
    if req_data.honeypot and req_data.honeypot.strip() != "":
        logger.warning(f"Bot submission caught via honeypot field from IP {client_ip}.")
        # Silently reject: return HTTP 200 success message to confuse spam bots without saving to DB
        return {
            "status": "success",
            "message": "Thank you! We will be in touch shortly.",
            "bot_filtered": True
        }

    # 2. Rate Limiting Check
    if is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many demo request attempts from this IP address. Please wait a few minutes before trying again."
        )

    # 3. Server-side Email Format Validation
    email_clean = req_data.work_email.strip().lower()
    if not EMAIL_REGEX.match(email_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format. Please provide a valid work email address (e.g. name@company.com)."
        )

    # 4. Save to Database
    record_ip_request(client_ip)

    new_lead = Lead(
        full_name=req_data.full_name.strip(),
        work_email=email_clean,
        phone_number=req_data.phone_number.strip() if req_data.phone_number else None,
        company_name=req_data.company_name.strip(),
        job_title=req_data.job_title.strip(),
        facility_type=req_data.facility_type.strip(),
        company_size=req_data.company_size.strip(),
        current_inspection_process=req_data.current_inspection_process.strip(),
        primary_need=req_data.primary_need.strip() if req_data.primary_need else None,
        source_page=req_data.source_page or "landing_page",
        ip_address=client_ip,
        submitted_at=datetime.now(timezone.utc)
    )

    db.add(new_lead)
    await db.commit()
    await db.refresh(new_lead)

    # 5. Dispatch Email Notification (Resend API)
    lead_dict = {
        "full_name": new_lead.full_name,
        "work_email": new_lead.work_email,
        "phone_number": new_lead.phone_number,
        "company_name": new_lead.company_name,
        "job_title": new_lead.job_title,
        "facility_type": new_lead.facility_type,
        "company_size": new_lead.company_size,
        "current_inspection_process": new_lead.current_inspection_process,
        "primary_need": new_lead.primary_need,
        "source_page": new_lead.source_page
    }
    await send_resend_email_notification(lead_dict)

    return {
        "status": "success",
        "message": "Thank you! Your demo request has been submitted. Our industrial safety team will reach out within 24 hours.",
        "lead_id": new_lead.id,
        "submitted_at": new_lead.submitted_at
    }

@router.get("/leads", status_code=status.HTTP_200_OK)
async def get_all_leads_endpoint(
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("admin", "safety_manager"))
):
    """
    Internal View of Submitted Leads (Admin & Safety Manager ONLY).
    Used to inspect demo requests and verify submissions during live demo.
    """
    stmt = select(Lead).order_by(Lead.submitted_at.desc())
    res = await db.execute(stmt)
    leads = res.scalars().all()

    return {
        "status": "success",
        "count": len(leads),
        "leads": [
            {
                "id": l.id,
                "full_name": l.full_name,
                "work_email": l.work_email,
                "phone_number": l.phone_number,
                "company_name": l.company_name,
                "job_title": l.job_title,
                "facility_type": l.facility_type,
                "company_size": l.company_size,
                "current_inspection_process": l.current_inspection_process,
                "primary_need": l.primary_need,
                "source_page": l.source_page,
                "ip_address": l.ip_address,
                "submitted_at": l.submitted_at
            }
            for l in leads
        ],
        "timestamp": datetime.now(timezone.utc)
    }
