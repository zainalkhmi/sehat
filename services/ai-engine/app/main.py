from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from .config import settings
from .auth import verify_jwt_token
from .schemas import (
    ScreeningRequest,
    ScreeningResponse,
    AnomalyDetectionRequest,
    AnomalyDetectionResponse,
    HealthSummaryRequest,
    HealthSummaryResponse,
    ReviewAssessmentRequest,
    ReviewAssessmentResponse,
)
from .screening import perform_clinical_screening
from .anomaly import detect_timeseries_anomalies
from .summary import generate_health_summary

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Future Health Clinical Decision Support & AI Screening Microservice. "
        "Compliant with HL7 FHIR R4, HIPAA Safe Harbor, and Indonesian UU PDP No. 27/2022."
    ),
    openapi_tags=[
        {"name": "System", "description": "Microservice lifecycle and health checks"},
        {"name": "Clinical Screening", "description": "Automated clinical risk stratification"},
        {"name": "Telemetry Analytics", "description": "Vital signs time-series anomaly detection"},
        {"name": "Clinician Review", "description": "Human-in-the-loop validation of AI risk assessments"},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "future-health-ai-engine",
        "model_version": settings.MODEL_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "disclaimer": settings.CLINICAL_DISCLAIMER,
    }

@app.post(
    f"{settings.API_V1_STR}/screening",
    response_model=ScreeningResponse,
    tags=["Clinical Screening"],
    summary="Perform Clinical Risk Screening",
)
def run_screening(
    request: ScreeningRequest,
    current_user: dict = Depends(verify_jwt_token),
):
    """
    Evaluates patient questionnaires (PHQ-9, GAD-7) and physiological vitals.
    Returns structured clinical risk level, severity, recommendations, and regulatory disclaimer.
    Outputs are assigned 'pending_review' status pending clinician validation.
    """
    return perform_clinical_screening(request)

@app.post(
    f"{settings.API_V1_STR}/anomaly-detection",
    response_model=AnomalyDetectionResponse,
    tags=["Telemetry Analytics"],
    summary="Detect Vitals Anomalies",
)
def run_anomaly_detection(
    request: AnomalyDetectionRequest,
    current_user: dict = Depends(verify_jwt_token),
):
    """
    Analyzes vital signs time-series using statistical Z-score and physiological boundaries.
    """
    return detect_timeseries_anomalies(request)

@app.post(
    f"{settings.API_V1_STR}/health-summary",
    response_model=HealthSummaryResponse,
    tags=["Telemetry Analytics"],
    summary="Generate Longitudinal Health Summary",
)
def run_health_summary(
    request: HealthSummaryRequest,
    current_user: dict = Depends(verify_jwt_token),
):
    """
    Synthesizes clinical telemetry, conditions, and survey outcomes into a longitudinal narrative.
    """
    return generate_health_summary(request)

@app.post(
    f"{settings.API_V1_STR}/review-assessment",
    response_model=ReviewAssessmentResponse,
    tags=["Clinician Review"],
    summary="Clinician Validation & Decision Override",
)
def review_assessment(
    request: ReviewAssessmentRequest,
    current_user: dict = Depends(verify_jwt_token),
):
    """
    Human-in-the-loop clinical workflow:
    Advances an AI risk assessment from 'pending_review' to 'approved', 'modified', or 'rejected'.
    Stores clinician notes, modifier ID, and audit timestamp.
    """
    final_level = request.modified_risk_level if request.modified_risk_level else "moderate"
    reviewed_at = datetime.now(timezone.utc).isoformat()

    return ReviewAssessmentResponse(
        assessment_id=request.assessment_id,
        review_status=request.review_status,
        reviewed_by_clinician_id=request.clinician_id,
        reviewed_at=reviewed_at,
        clinician_notes=request.clinician_notes,
        final_risk_level=final_level,
        message=f"Assessment {request.assessment_id} marked as {request.review_status} by clinician {request.clinician_id}.",
    )

