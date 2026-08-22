import io
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable

from api.models.asset import Asset
from api.models.risk_score import RiskScore, Explanation
from api.models.audit_log import AuditLog

logger = logging.getLogger(__name__)

def build_pdf_styles():
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=15
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=10,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#334155")
    )

    badge_high = ParagraphStyle(
        'BadgeHigh',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=13,
        textColor=colors.HexColor("#DC2626"),
        alignment=1
    )

    badge_medium = ParagraphStyle(
        'BadgeMedium',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=13,
        textColor=colors.HexColor("#D97706"),
        alignment=1
    )

    badge_low = ParagraphStyle(
        'BadgeLow',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=13,
        textColor=colors.HexColor("#059669"),
        alignment=1
    )

    return {
        'title': title_style,
        'subtitle': subtitle_style,
        'section': section_heading,
        'body': body_style,
        'badge_high': badge_high,
        'badge_medium': badge_medium,
        'badge_low': badge_low
    }

async def generate_asset_report(db: AsyncSession, asset_id: int) -> bytes:
    """
    Generates a single asset's comprehensive PDF safety report.
    Includes score breakdown, RAG SOP grounded explanation, and audit log history.
    """
    # Fetch asset
    asset_res = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = asset_res.scalar_one_or_none()
    if not asset:
        raise ValueError(f"Asset #{asset_id} not found")

    # Fetch risk score & explanation (latest entry)
    score_res = await db.execute(select(RiskScore).where(RiskScore.asset_id == asset_id).order_by(RiskScore.computed_at.desc(), RiskScore.id.desc()).limit(1))
    score = score_res.scalar_one_or_none()

    exp_res = await db.execute(
        select(Explanation).join(RiskScore, Explanation.risk_score_id == RiskScore.id).where(RiskScore.asset_id == asset_id).order_by(Explanation.id.desc()).limit(1)
    )
    explanation = exp_res.scalar_one_or_none()

    # Fetch audit log entries
    audit_res = await db.execute(select(AuditLog).where(AuditLog.asset_id == asset_id).order_by(AuditLog.created_at.desc()))
    audit_logs = audit_res.scalars().all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []
    style_dict = build_pdf_styles()

    # Header Banner
    banner_data = [
        [
            Paragraph("<b>RISK RADAR</b> • Industrial Safety Risk Intelligence", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=14, textColor=colors.white)),
            Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", ParagraphStyle('H2', fontName='Helvetica', fontSize=9, textColor=colors.HexColor("#94A3B8"), alignment=2))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[360, 180])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0F172A")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 15))

    # Asset Title & Risk Band Badge
    risk_band = (score.risk_band if score else "UNKNOWN").upper()
    badge_style = style_dict['badge_high'] if risk_band == "HIGH" else (style_dict['badge_medium'] if risk_band == "MEDIUM" else style_dict['badge_low'])
    
    asset_header_data = [
        [
            Paragraph(f"<b>Asset #{asset.id}: {asset.name}</b>", style_dict['title']),
            Paragraph(f"<b>RISK BAND: {risk_band}</b>", badge_style)
        ]
    ]
    asset_header_table = Table(asset_header_data, colWidths=[400, 140])
    asset_header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 4)
    ]))
    story.append(asset_header_table)
    story.append(Paragraph(f"Location: {asset.location} | Equipment Type: {asset.asset_type} | Consequence Rating: {asset.consequence_score}/5", style_dict['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=12))

    # Score Breakdown Table
    story.append(Paragraph("<b>Quantitative Risk Evaluation Breakdown</b>", style_dict['section']))
    priority_val = (score.fused_score * asset.consequence_score) if (score and asset) else 0.0
    score_table_data = [
        ["Metric", "Score / Rating", "Description"],
        ["Deterministic Rule Score", f"{score.rule_score:.1f} / 100" if score else "N/A", "SCADA sensor threshold violations & maintenance overdue rules"],
        ["XGBoost ML Probability", f"{score.ml_score:.1f} / 100" if score else "N/A", "Gradient boosted failure probability model prediction"],
        ["Fused Risk Score", f"{score.fused_score:.1f} / 100" if score else "N/A", "Hybrid weighted score (50% Rule + 50% ML Engine)"],
        ["Priority Criticality Score", f"{priority_val:.1f}" if score else "N/A", "Consequence-adjusted inspection prioritization ranking"]
    ]
    score_table = Table(score_table_data, colWidths=[150, 110, 280])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    story.append(score_table)
    story.append(Spacer(1, 15))

    # Grounded AI Explanation & SOP Recommendation
    story.append(Paragraph("<b>AI Grounded Explanation & SOP Recommended Action</b>", style_dict['section']))
    
    explanation_text = explanation.explanation_text if explanation else "No grounded AI explanation available for this asset. Operating based on deterministic rule breakdown."
    recommended_action = explanation.recommended_action if explanation else "Perform standard routine inspection according to site maintenance schedule."
    cited_source = explanation.retrieved_source_title if (explanation and explanation.retrieved_source_title) else "Standard Plant Safety Guidelines"

    exp_box_data = [
        [Paragraph(f"<b>Root Cause Explanation:</b><br/>{explanation_text}", style_dict['body'])],
        [Paragraph(f"<b>Recommended Maintenance Action:</b><br/>{recommended_action}", style_dict['body'])],
        [Paragraph(f"<b>Cited SOP Document Source:</b><br/>{cited_source}", style_dict['body'])]
    ]
    exp_table = Table(exp_box_data, colWidths=[540])
    exp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#94A3B8")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,0), 0.5, colors.HexColor("#E2E8F0")),
        ('LINEBELOW', (0,1), (-1,1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(exp_table)
    story.append(Spacer(1, 15))

    # Audit Trail History Section
    story.append(Paragraph(f"<b>Audit Log Lineage ({len(audit_logs)} Records)</b>", style_dict['section']))
    audit_rows = [["Timestamp (UTC)", "Operator / Role", "Event / Score Breakdown", "SHA-256 Hash Link"]]
    for log_item in audit_logs[:5]: # Top 5 recent audit entries
        ts_str = log_item.created_at.strftime('%Y-%m-%d %H:%M') if log_item.created_at else "N/A"
        op_str = f"{log_item.user_id or 'System'} ({log_item.role or 'Automated'})"
        breakdown_summary = f"Fused: {log_item.score_breakdown.get('fused_score', 'N/A')}" if isinstance(log_item.score_breakdown, dict) else "Logged"
        hash_short = (log_item.hash[:12] + "...") if log_item.hash else "Genesis"
        audit_rows.append([ts_str, op_str, breakdown_summary, hash_short])

    if len(audit_rows) == 1:
        audit_rows.append(["N/A", "System Initialized", "Initial asset registration", "N/A"])

    audit_table = Table(audit_rows, colWidths=[110, 140, 160, 130])
    audit_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 5)
    ]))
    story.append(audit_table)

    doc.build(story)
    return buffer.getvalue()

async def generate_facility_report(db: AsyncSession, organization_id: int = 1) -> bytes:
    """
    Generates a multi-page consolidated facility report covering all flagged (Medium/High) assets,
    sorted by priority score.
    """
    # Fetch all assets for organization with scores
    stmt = select(Asset, RiskScore).join(RiskScore, Asset.id == RiskScore.asset_id).where(Asset.organization_id == organization_id).order_by(RiskScore.computed_at.desc())
    res = await db.execute(stmt)
    raw_rows = res.all()

    # Deduplicate assets (take latest score per asset) and compute priority_score
    asset_dict = {}
    for a, r in raw_rows:
        if a.id not in asset_dict:
            p_val = r.fused_score * a.consequence_score
            asset_dict[a.id] = (a, r, p_val)

    rows = list(asset_dict.values())
    rows.sort(key=lambda item: item[2], reverse=True) # Sort by priority score descending

    # Calculate Summary Statistics
    total_assets = len(rows)
    high_count = sum(1 for a, r, p in rows if r.risk_band == "high")
    medium_count = sum(1 for a, r, p in rows if r.risk_band == "medium")
    low_count = sum(1 for a, r, p in rows if r.risk_band == "low")

    flagged_rows = [(a, r, p) for a, r, p in rows if r.risk_band in ["high", "medium"]]

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []
    style_dict = build_pdf_styles()

    # Cover Header
    banner_data = [
        [
            Paragraph("<b>RISK RADAR</b> • Facility Safety Intelligence Summary Report", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=14, textColor=colors.white)),
            Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", ParagraphStyle('H2', fontName='Helvetica', fontSize=9, textColor=colors.HexColor("#94A3B8"), alignment=2))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[360, 180])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0F172A")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 15))

    story.append(Paragraph("<b>Executive Facility Safety Summary</b>", style_dict['title']))
    story.append(Paragraph(f"Total Monitored Industrial Assets: {total_assets} | Action Required Flagged: {len(flagged_rows)} Assets", style_dict['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=15))

    # Summary Statistics Cards Table
    stats_data = [
        [
            Paragraph("<b>HIGH RISK ASSETS</b><br/><font size=16 color='#DC2626'><b>{}</b></font>".format(high_count), style_dict['body']),
            Paragraph("<b>MEDIUM RISK ASSETS</b><br/><font size=16 color='#D97706'><b>{}</b></font>".format(medium_count), style_dict['body']),
            Paragraph("<b>LOW RISK ASSETS</b><br/><font size=16 color='#059669'><b>{}</b></font>".format(low_count), style_dict['body'])
        ]
    ]
    stats_table = Table(stats_data, colWidths=[180, 180, 180])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'CENTER')
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 15))

    # Top Priority Flagged Assets Summary Table
    story.append(Paragraph("<b>Top Priority Flagged Assets Requiring Immediate Action</b>", style_dict['section']))
    top_rows = [["Rank", "Asset Name", "Location", "Risk Band", "Fused Score", "Priority Score"]]
    for idx, (asset, score, p_val) in enumerate(flagged_rows[:5], 1):
        top_rows.append([
            str(idx),
            asset.name,
            asset.location,
            score.risk_band.upper(),
            f"{score.fused_score:.1f}",
            f"{p_val:.1f}"
        ])

    if len(top_rows) == 1:
        top_rows.append(["-", "No High/Medium risk assets flagged", "All units nominal", "LOW", "0.0", "0.0"])

    top_table = Table(top_rows, colWidths=[40, 180, 140, 80, 50, 50])
    top_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    story.append(top_table)
    story.append(Spacer(1, 20))

    # Detail Sections for each flagged asset
    if flagged_rows:
        story.append(PageBreak())
        story.append(Paragraph("<b>Detailed Flagged Asset Inspection & SOP Recommendations</b>", style_dict['title']))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=15))

        for asset, score, p_val in flagged_rows:
            exp_res = await db.execute(
                select(Explanation).join(RiskScore, Explanation.risk_score_id == RiskScore.id).where(RiskScore.asset_id == asset.id).order_by(Explanation.id.desc()).limit(1)
            )
            exp = exp_res.scalar_one_or_none()

            exp_text = exp.explanation_text if exp else "No grounded AI explanation generated. Review rule breakdown."
            rec_action = exp.recommended_action if exp else "Schedule inspection per standard SOP."
            cited_src = exp.retrieved_source_title if (exp and exp.retrieved_source_title) else "Standard Maintenance Protocol"

            item_content = [
                Paragraph(f"<b>Asset #{asset.id}: {asset.name}</b> (Location: {asset.location})", style_dict['section']),
                Paragraph(f"Risk Band: <b>{score.risk_band.upper()}</b> | Fused Score: <b>{score.fused_score:.1f}</b> | Priority Score: <b>{p_val:.1f}</b>", style_dict['body']),
                Spacer(1, 4),
                Paragraph(f"<b>Grounded Cause:</b> {exp_text}", style_dict['body']),
                Paragraph(f"<b>Recommended Action:</b> {rec_action}", style_dict['body']),
                Paragraph(f"<b>SOP Source:</b> {cited_src}", style_dict['body']),
                Spacer(1, 10),
                HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=10)
            ]
            story.append(KeepTogether(item_content))

    doc.build(story)
    return buffer.getvalue()
