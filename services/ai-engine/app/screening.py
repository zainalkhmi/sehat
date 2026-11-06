import hashlib
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from .schemas import ScreeningRequest, ScreeningResponse, VitalReading
from .config import settings

def compute_input_hash(patient_id: str, data: Dict[str, Any]) -> str:
    serialized = f"{patient_id}:{sorted(data.items())}"
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:16]

def evaluate_phq9(answers: Dict[str, Any]) -> Tuple[float, str, str, List[str], bool]:
    total_score = 0
    item_9_positive = False

    for i in range(1, 10):
        val = answers.get(str(i), answers.get(f"phq9_{i}", 0))
        try:
            val_num = int(val)
        except (ValueError, TypeError):
            val_num = 0
        val_clamped = max(0, min(3, val_num))
        total_score += val_clamped
        if i == 9 and val_clamped > 0:
            item_9_positive = True

    # Risk score normalized 0.0 - 1.0
    normalized_score = round(total_score / 27.0, 4)

    if item_9_positive:
        risk_level = "critical"
        summary = f"PHQ-9 Total Score: {total_score}/27. CRITICAL: Patient endorsed thoughts of self-harm or suicide on Item 9."
        recs = [
            "Initiate immediate suicide risk assessment and patient safety protocol.",
            "Contact on-call psychiatric consultant or crisis response team.",
            "Ensure patient is not left unaccompanied if evaluated in clinic.",
        ]
    elif total_score >= 20:
        risk_level = "high"
        summary = f"PHQ-9 Total Score: {total_score}/27 (Severe Depression)."
        recs = [
            "Urgent clinical psychiatric evaluation within 24-48 hours.",
            "Consider combined pharmacotherapy and high-intensity psychotherapy.",
            "Schedule weekly symptom monitoring.",
        ]
    elif total_score >= 15:
        risk_level = "high"
        summary = f"PHQ-9 Total Score: {total_score}/27 (Moderately Severe Depression)."
        recs = [
            "Initiate active evidence-based pharmacotherapy and/or structured psychotherapy.",
            "Follow-up consultation within 2 weeks.",
        ]
    elif total_score >= 10:
        risk_level = "moderate"
        summary = f"PHQ-9 Total Score: {total_score}/27 (Moderate Depression)."
        recs = [
            "Create structured clinical management plan.",
            "Consider psychotherapy or supportive counseling.",
            "Re-evaluate in 4 weeks.",
        ]
    elif total_score >= 5:
        risk_level = "low"
        summary = f"PHQ-9 Total Score: {total_score}/27 (Mild Depression)."
        recs = [
            "Provide psychoeducation and lifestyle recommendations (sleep, exercise).",
            "Watchful waiting with re-assessment in 4-6 weeks.",
        ]
    else:
        risk_level = "low"
        summary = f"PHQ-9 Total Score: {total_score}/27 (Minimal or No Depression)."
        recs = ["Continue routine preventive care."]

    return normalized_score, risk_level, summary, recs, item_9_positive

def evaluate_gad7(answers: Dict[str, Any]) -> Tuple[float, str, str, List[str]]:
    total_score = 0
    for i in range(1, 8):
        val = answers.get(str(i), answers.get(f"gad7_{i}", 0))
        try:
            val_num = int(val)
        except (ValueError, TypeError):
            val_num = 0
        total_score += max(0, min(3, val_num))

    normalized_score = round(total_score / 21.0, 4)

    if total_score >= 15:
        risk_level = "high"
        summary = f"GAD-7 Total Score: {total_score}/21 (Severe Anxiety)."
        recs = [
            "Comprehensive anxiety disorder diagnostic evaluation.",
            "Initiate cognitive behavioral therapy (CBT) or pharmacotherapy.",
        ]
    elif total_score >= 10:
        risk_level = "moderate"
        summary = f"GAD-7 Total Score: {total_score}/21 (Moderate Anxiety)."
        recs = [
            "Explore lifestyle triggers and stress reduction techniques.",
            "Consider formal CBT or counseling.",
        ]
    elif total_score >= 5:
        risk_level = "low"
        summary = f"GAD-7 Total Score: {total_score}/21 (Mild Anxiety)."
        recs = ["Supportive counseling and symptom monitoring."]
    else:
        risk_level = "low"
        summary = f"GAD-7 Total Score: {total_score}/21 (Minimal Anxiety)."
        recs = ["Continue standard wellness practices."]

    return normalized_score, risk_level, summary, recs

def evaluate_cardiovascular_vitals(vitals: List[VitalReading]) -> Tuple[float, str, str, List[str]]:
    systolic = None
    diastolic = None
    heart_rate = None

    for v in vitals:
        if v.loinc_code == "8480-6" or "systolic" in v.display_name.lower():
            systolic = v.value
        elif v.loinc_code == "8462-4" or "diastolic" in v.display_name.lower():
            diastolic = v.value
        elif v.loinc_code == "8867-4" or "heart" in v.display_name.lower():
            heart_rate = v.value

    risk_score = 0.1
    risk_level = "low"
    findings = []
    recs = []

    if systolic and diastolic:
        if systolic >= 180 or diastolic >= 120:
            risk_level = "critical"
            risk_score = 0.95
            findings.append(f"Hypertensive Crisis: BP {systolic}/{diastolic} mmHg")
            recs.append("Immediate emergency medical evaluation required.")
        elif systolic >= 140 or diastolic >= 90:
            risk_level = "high"
            risk_score = 0.75
            findings.append(f"Stage 2 Hypertension: BP {systolic}/{diastolic} mmHg")
            recs.append("Recommend antihypertensive medication evaluation and lifestyle modifications.")
        elif systolic >= 130 or diastolic >= 80:
            risk_level = "moderate"
            risk_score = 0.45
            findings.append(f"Stage 1 Hypertension: BP {systolic}/{diastolic} mmHg")
            recs.append("Recommend lifestyle counseling, low sodium diet, and repeat BP check in 2-4 weeks.")
        else:
            findings.append(f"Blood Pressure within normal limits: {systolic}/{diastolic} mmHg")

    if heart_rate:
        if heart_rate > 120:
            findings.append(f"Tachycardia: Resting HR {heart_rate} bpm")
            risk_score = max(risk_score, 0.65)
            if risk_level == "low":
                risk_level = "moderate"
            recs.append("Evaluate potential secondary causes of tachycardia (dehydration, thyroid, infection).")
        elif heart_rate < 50:
            findings.append(f"Bradycardia: Resting HR {heart_rate} bpm")
            risk_score = max(risk_score, 0.55)
            if risk_level == "low":
                risk_level = "moderate"
            recs.append("Assess for symptoms of dizziness, syncope, or medication effects.")

    summary = "; ".join(findings) if findings else "Vitals evaluated; no acute cardiovascular abnormalities detected."
    if not recs:
        recs.append("Maintain routine physical activity and balanced nutrition.")

    return risk_score, risk_level, summary, recs

def perform_clinical_screening(request: ScreeningRequest) -> ScreeningResponse:
    assessment_id = f"ai-risk-{uuid.uuid4().hex[:12]}"
    created_at = datetime.now(timezone.utc).isoformat()
    q_id = (request.questionnaire_id or "").lower()

    if "phq" in q_id or "depression" in q_id:
        risk_category = "depression-screening"
        score, level, summary, recs, is_critical = evaluate_phq9(request.answers)
    elif "gad" in q_id or "anxiety" in q_id:
        risk_category = "anxiety-screening"
        score, level, summary, recs = evaluate_gad7(request.answers)
    elif request.recent_vitals:
        risk_category = "cardiovascular-telemetry-screening"
        score, level, summary, recs = evaluate_cardiovascular_vitals(request.recent_vitals)
    else:
        risk_category = "general-health-screening"
        score = 0.1
        level = "low"
        summary = "No significant acute clinical risks identified from available inputs."
        recs = ["Continue periodic preventive health checks."]

    input_hash = compute_input_hash(request.patient_id, {
        "q_id": q_id,
        "answers": request.answers,
        "vitals_count": len(request.recent_vitals),
    })

    return ScreeningResponse(
        id=assessment_id,
        patient_id=request.patient_id,
        risk_category=risk_category,
        risk_score=score,
        risk_level=level,
        clinical_summary=summary,
        limitations="Risk calculation is rule-based and derived solely from patient-reported outcomes or discrete sensor samples. Confounding medical history, acute illness, and medications must be evaluated clinically.",
        recommendations=recs,
        input_references=[f"hash:{input_hash}"],
        model_name="FutureHealth-ClinicalScreening-Engine",
        model_version=settings.MODEL_VERSION,
        disclaimer=settings.CLINICAL_DISCLAIMER,
        review_status="pending_review",
        created_at=created_at,
    )

