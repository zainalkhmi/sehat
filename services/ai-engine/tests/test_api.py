from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "CLINICAL DECISION SUPPORT" in data["disclaimer"]

def test_screening_endpoint_via_api():
    payload = {
        "patient_id": "pt-api-101",
        "questionnaire_id": "phq-9",
        "answers": {"1": 2, "2": 3, "3": 2, "4": 2, "5": 1, "6": 2, "7": 2, "8": 1, "9": 0},
    }
    response = client.post("/api/v1/screening", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "pt-api-101"
    assert data["risk_category"] == "depression-screening"
    assert data["review_status"] == "pending_review"
    assert data["risk_level"] == "high"

def test_anomaly_detection_via_api():
    payload = {
        "patient_id": "pt-api-102",
        "loinc_code": "8867-4",
        "display_name": "Heart Rate",
        "timeseries": [
            {"timestamp": "2026-11-05T01:00:00Z", "value": 72.0},
            {"timestamp": "2026-11-05T02:00:00Z", "value": 74.0},
            {"timestamp": "2026-11-05T03:00:00Z", "value": 140.0},
        ],
    }
    response = client.post("/api/v1/anomaly-detection", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["anomalies_detected"] >= 1

def test_health_summary_via_api():
    payload = {
        "patient_id": "pt-api-103",
        "timeframe_days": 30,
        "recent_vitals": [
            {
                "loinc_code": "8480-6",
                "display_name": "Systolic BP",
                "value": 142.0,
                "unit": "mmHg",
                "timestamp": "2026-11-05T08:00:00Z",
            }
        ],
        "known_conditions": ["Essential Hypertension"],
        "recent_questionnaire_scores": {"phq-9": 14.0},
    }
    response = client.post("/api/v1/health-summary", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["abnormal_findings"]) >= 1
    assert "Cardiovascular & BP Optimization" in data["suggested_focus_areas"]

def test_review_assessment_workflow_via_api():
    payload = {
        "assessment_id": "ai-risk-sample-99",
        "clinician_id": "dr-wijaya-303",
        "review_status": "approved",
        "clinician_notes": "Agreed with high-risk depression finding. Prescribed SSRI and referred to clinical psychologist.",
        "modified_risk_level": "high",
    }
    response = client.post("/api/v1/review-assessment", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["review_status"] == "approved"
    assert data["reviewed_by_clinician_id"] == "dr-wijaya-303"
    assert data["final_risk_level"] == "high"

