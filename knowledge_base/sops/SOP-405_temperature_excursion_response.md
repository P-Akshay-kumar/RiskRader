# SOP-405: SCADA Temperature Excursion & Thermal Overload Protocol
**Document ID:** SOP-405-REV1  
**Applicability:** Motor Stators, Hydrocracker Pumps, Compressors, Reboilers  

## 1. Temperature Telemetry Out-of-Range Excursions
Temperature anomalies indicate severe friction, insufficient coolant flow, or electrical winding short-circuits. Standard safe operating limits:
- Motor Bearing Housing: Max 85°C
- Winding Stator Temperature: Max 110°C
- Process Fluid Exit Line: Safe Range 40°C to 160°C

## 2. Mandatory Emergency Response Protocol
If SCADA temperature readings exceed upper threshold (safe_max) for > 15 consecutive minutes:
1. **Cooling Water Flow Check:** Verify shell-and-tube heat exchanger cooling water inlet valve is 100% open and inlet temp is < 25°C.
2. **Load Curtailment:** Ramp down motor VFD speed by 25% to lower thermal dissipation.
3. **Thermography Inspection:** Perform infrared thermography scan on junction box and bearing caps to locate localized hotspots.
4. **Emergency Trip:** If bearing temperature surpasses 105°C, execute immediate emergency trip (ESD-405).
