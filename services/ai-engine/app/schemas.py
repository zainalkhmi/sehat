from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class VitalReading(BaseModel):
    loinc_code: str
    display_name: str
    value: float
    unit: str
    timestamp: str

class ScreeningRequest(BaseModel):
    patient_id: str
    questionnaire_id: Optional[str] = None
    answers: Dict[str, Any] = Field(default_factory=dict)
    recent_vitals: List[VitalReading] = Field(default_factory=list)
    patient_age: Optional[int] = None
    patient_gender: Optional[Literal["male", "female", "other", "unknown"]] = None

class ScreeningResponse(BaseModel):
    id: str
    patient_id: str
    risk_category: str
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: Literal["low", "moderate", "high", "critical"]
    clinical_summary: str
    limitations: str
    recommendations: List[str]
    input_references: List[str]
    model_name: str
    model_version: str
    disclaimer: str
    review_status: Literal["pending_review", "approved", "modified", "rejected"] = "pending_review"
    created_at: str

class TimeSeriesPoint(BaseModel):
    timestamp: str
    value: float

class AnomalyDetectionRequest(BaseModel):
    patient_id: str
    loinc_code: str
    display_name: str
    timeseries: List[TimeSeriesPoint]
    sensitivity: float = Field(default=2.5, description="Z-score threshold for anomaly detection")

class AnomalyPoint(BaseModel):
    timestamp: str
    value: float
    z_score: float
    is_anomaly: bool
    reason: Optional[str] = None

class AnomalyDetectionResponse(BaseModel):
    patient_id: str
    loinc_code: str
    display_name: str
    total_points: int
    anomalies_detected: int
    points: List[AnomalyPoint]
    summary: str

class HealthSummaryRequest(BaseModel):
    patient_id: str
    timeframe_days: int = 30
    recent_vitals: List[VitalReading] = Field(default_factory=list)
    known_conditions: List[str] = Field(default_factory=list)
    recent_questionnaire_scores: Dict[str, float] = Field(default_factory=dict)

class HealthSummaryResponse(BaseModel):
    patient_id: str
    timeframe_days: int
    summary_narrative: str
    vital_trends: Dict[str, str]
    abnormal_findings: List[str]
    suggested_focus_areas: List[str]
    generated_at: str
    disclaimer: str

class ReviewAssessmentRequest(BaseModel):
    assessment_id: str
    clinician_id: str
    review_status: Literal["approved", "modified", "rejected"]
    clinician_notes: Optional[str] = None
    modified_risk_level: Optional[Literal["low", "moderate", "high", "critical"]] = None

class ReviewAssessmentResponse(BaseModel):
    assessment_id: str
    review_status: str
    reviewed_by_clinician_id: str
    reviewed_at: str
    clinician_notes: Optional[str]
    final_risk_level: str
    message: str

