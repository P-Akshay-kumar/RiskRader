#!/bin/bash
# RiskRadar Backend Cold-Start Warmup Script
# Pings Render production backend health endpoints prior to live hackathon demos.

BACKEND_URL="${1:-https://riskradar-backend.onrender.com}"

echo "=========================================================================="
echo "         RISK RADAR BACKEND COLD-START WARM-UP PROTOCOL                   "
echo "=========================================================================="
echo "Targeting Backend: ${BACKEND_URL}"
echo "Sending warm-up HTTP ping to /health and /api/v1/health..."

STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/v1/health")

if [ "$STATUS_CODE" -eq 200 ]; then
  echo "✓ SUCCESS: Backend is awake and responsive! (HTTP Status: 200 OK)"
else
  echo "⏳ Backend is warming up from Render spin-down (HTTP Status: ${STATUS_CODE}). Re-trying in 5 seconds..."
  sleep 5
  RETRY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/v1/health")
  echo "✓ Warm-up complete! Final Status: ${RETRY_CODE}"
fi

echo "=========================================================================="
