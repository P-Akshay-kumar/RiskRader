export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface RankedAsset {
  rank: number;
  asset_id: number;
  asset_name: string;
  asset_type: string;
  location: string;
  rule_score: number;
  ml_score: number;
  fused_score: number;
  risk_band: "low" | "medium" | "high" | "critical" | string;
  consequence_score: number;
  needs_review: boolean;
  priority_score: number;
  recommended_action?: string;
  cited_source?: string;
  explanation?: string;
}

export interface PlantAlert {
  alert_id: number;
  asset_id: number;
  asset_name: string;
  previous_band: string;
  new_band: string;
  message: string;
  acknowledged: boolean;
  triggered_at: string;
}

export interface PipelineSummary {
  status: string;
  assets_processed: number;
  alerts_created: number;
  processing_time_seconds: number;
  ranked_summary: RankedAsset[];
  timestamp: string;
}

export interface AuditLogEntry {
  audit_id: number;
  asset_id: number;
  input_data_snapshot: {
    factor_breakdown?: any;
    retrieved_source?: string;
  };
  score_breakdown: {
    rule_score?: number;
    ml_score?: number;
    fused_score?: number;
    priority_score?: number;
    explanation?: string;
    recommended_action?: string;
    cited_source?: string;
  };
  created_at: string;
}

export interface AuditLogResponse {
  status: string;
  asset_id: number;
  asset_name: string;
  audit_count: number;
  audit_trail: AuditLogEntry[];
  timestamp: string;
}

export interface SopContextItem {
  id: string;
  source_file: string;
  source_title: string;
  similarity_score: number;
  text: string;
}

export interface SopContextResponse {
  status: string;
  asset_id: number;
  asset_name: string;
  generated_query: string;
  retrieved_sops: SopContextItem[];
  timestamp: string;
}

export interface AssetFeatureItem {
  asset_id: number;
  days_since_last_maintenance: number;
  failure_count_last_12_months: number;
  pct_sensor_readings_out_of_range: number;
  latest_inspection_severity: string;
  incident_count: number;
  updated_at: string;
}

const DEFAULT_HEADERS = {
  Authorization: "Bearer safety_manager_token",
};

export async function fetchRankedAssets(): Promise<RankedAsset[]> {
  const res = await fetch(`${API_BASE_URL}/risk/ranked`, {
    cache: "no-store",
    headers: DEFAULT_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`API error (${res.status}): Failed to fetch ranked assets from ${API_BASE_URL}`);
  }
  const data = await res.json();
  return data.results || [];
}

export async function fetchAlerts(): Promise<PlantAlert[]> {
  const res = await fetch(`${API_BASE_URL}/alerts`, {
    cache: "no-store",
    headers: DEFAULT_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`API error (${res.status}): Failed to fetch alerts from ${API_BASE_URL}`);
  }
  const data = await res.json();
  return data.alerts || [];
}

export async function acknowledgeAlert(alertId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
    method: "POST",
    headers: { ...DEFAULT_HEADERS, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API error (${res.status}): Failed to acknowledge alert #${alertId}`);
  }
}

export async function triggerPipelineRun(): Promise<PipelineSummary> {
  const res = await fetch(`${API_BASE_URL}/pipeline/run`, {
    method: "POST",
    headers: { ...DEFAULT_HEADERS, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API error (${res.status}): Failed to execute full pipeline`);
  }
  return await res.json();
}

export async function fetchAssetAuditTrail(
  assetId: number
): Promise<AuditLogResponse> {
  const res = await fetch(`${API_BASE_URL}/audit-log/${assetId}`, {
    cache: "no-store",
    headers: DEFAULT_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`API error (${res.status}): Failed to fetch audit trail for asset #${assetId}`);
  }
  return await res.json();
}

export async function fetchAssetSopContext(
  assetId: number
): Promise<SopContextResponse> {
  const res = await fetch(`${API_BASE_URL}/risk/${assetId}/retrieve-context`, {
    cache: "no-store",
    headers: DEFAULT_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`API error (${res.status}): Failed to fetch SOP context for asset #${assetId}`);
  }
  return await res.json();
}

export async function fetchAssetFeatures(): Promise<AssetFeatureItem[]> {
  const res = await fetch(`${API_BASE_URL}/risk/features`, {
    cache: "no-store",
    headers: DEFAULT_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`API error (${res.status}): Failed to fetch asset features`);
  }
  return await res.json();
}

export function getExportAuditLogUrl(assetId: number): string {
  return `${API_BASE_URL}/audit-log/${assetId}/export`;
}

export function getDownloadTemplateUrl(format: "csv" | "xlsx" = "csv"): string {
  return `${API_BASE_URL}/upload/template?format=${format}`;
}

export function getAssetPdfExportUrl(assetId: number): string {
  return `${API_BASE_URL}/risk/${assetId}/export-pdf`;
}

export function getFacilityPdfExportUrl(): string {
  return `${API_BASE_URL}/reports/facility-export-pdf`;
}

export async function uploadDataset(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/upload/dataset`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
  }
  return await res.json();
}

export async function uploadPdfExperimental(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/upload/pdf`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `PDF extraction failed with status ${res.status}`);
  }
  return await res.json();
}
