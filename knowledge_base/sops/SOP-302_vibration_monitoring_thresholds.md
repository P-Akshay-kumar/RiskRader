# SOP-302: SCADA Vibration Monitoring & Telemetry Out-of-Range Thresholds
**Document ID:** SOP-302-REV5  
**Applicability:** Rotating Turbines, Gas Compressors, Heavy Blower Fans  

## 1. SCADA Telemetry Limits (ISO 10816-3 Class III)
SCADA telemetry sensors sample tri-axial vibration velocity (mm/s RMS) and overall displacement. When telemetry out-of-range readings exceed 25% of samples within a 24-hour window, immediate diagnostic logging is required.

## 2. Action Matrix Based on Vibration Deviations
- **Zone A (0 - 2.8 mm/s):** Normal continuous operation.
- **Zone B (2.8 - 4.5 mm/s):** Acceptable for unrestricted long-term operation.
- **Zone C (4.5 - 7.1 mm/s WARNING):** Elevated risk. Schedule vibration FFT spectrum analysis to check 1X unbalance vs 2X shaft misalignment. Re-lubricate bearings within 48 hours.
- **Zone D (> 7.1 mm/s DANGER):** Critical mechanical defect. Trigger automated trip or manual emergency stop within 10 minutes to prevent catastrophic impeller destruction.
