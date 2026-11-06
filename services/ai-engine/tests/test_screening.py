from app.schemas import ScreeningRequest, VitalReading
from app.screening import perform_clinical_screening

def test_phq9_minimal_depression():
    req = ScreeningRequest(
        patient_id="pt-test-01",
        questionnaire_id="phq-9",
        answers={str(i): 0 for i in range(1, 10)},
    )
    res = perform_clinical_screening(req)
    assert res.risk_category == "depression-screening"
    assert res.risk_score == 0.0
    assert res.risk_level == "low"
    assert res.review_status == "pending_review"
    assert "CLINICAL DECISION SUPPORT ONLY" in res.disclaimer

def test_phq9_severe_depression():
    req = ScreeningRequest(
        patient_id="pt-test-02",
        questionnaire_id="phq-9",
        answers={str(i): 3 for i in range(1, 9)} | {"9": 0},
    )
    res = perform_clinical_screening(req)
    assert res.risk_category == "depression-screening"
    assert res.risk_score >= 0.7
    assert res.risk_level == "high"
    assert "Severe Depression" in res.clinical_summary

def test_phq9_suicide_ideation_critical_alert():
    # Low score overall (3/27), but positive on Question 9 (thoughts of self-harm)
    req = ScreeningRequest(
        patient_id="pt-test-03",
        questionnaire_id="phq-9",
        answers={"1": 1, "9": 2},
    )
    res = perform_clinical_screening(req)
    assert res.risk_level == "critical"
    assert "CRITICAL" in res.clinical_summary
    assert any("suicide risk" in r.lower() for r in res.recommendations)

def test_cardiovascular_hypertensive_crisis():
    req = ScreeningRequest(
        patient_id="pt-test-04",
        recent_vitals=[
            VitalReading(
                loinc_code="8480-6",
                display_name="Systolic blood pressure",
                value=188.0,
                unit="mmHg",
                timestamp="2026-11-05T10:00:00Z",
            ),
            VitalReading(
                loinc_code="8462-4",
                display_name="Diastolic blood pressure",
                value=122.0,
                unit="mmHg",
                timestamp="2026-11-05T10:00:00Z",
            ),
        ],
    )
    res = perform_clinical_screening(req)
    assert res.risk_category == "cardiovascular-telemetry-screening"
    assert res.risk_level == "critical"
    assert res.risk_score >= 0.9
    assert "Hypertensive Crisis" in res.clinical_summary
