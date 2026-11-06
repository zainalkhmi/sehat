from datetime import datetime, timezone
from typing import Dict, List
from .schemas import HealthSummaryRequest, HealthSummaryResponse
from .config import settings

def generate_health_summary(request: HealthSummaryRequest) -> HealthSummaryResponse:
    now_str = datetime.now(timezone.utc).isoformat()
    abnormal_findings: List[str] = []
    vital_trends: Dict[str, str] = {}
    focus_areas: List[str] = []

    # Analyze vitals
    vitals_by_code: Dict[str, List[float]] = {}
    for v in request.recent_vitals:
        vitals_by_code.setdefault(v.display_name, []).append(v.value)

    for name, vals in vitals_by_code.items():
        avg_val = sum(vals) / len(vals)
        vital_trends[name] = f"Average: {round(avg_val, 1)} (n={len(vals)} readings)"
        if "Systolic" in name and avg_val >= 135:
            abnormal_findings.append(f"Elevated average systolic blood pressure ({round(avg_val, 1)} mmHg)")
            focus_areas.append("Cardiovascular & BP Optimization")
        elif "Heart" in name and avg_val > 100:
            abnormal_findings.append(f"Elevated resting heart rate ({round(avg_val, 1)} bpm)")
            focus_areas.append("Tachycardia Workup")
        elif "Oxygen" in name and avg_val < 95:
            abnormal_findings.append(f"Borderline low oxygen saturation ({round(avg_val, 1)}%)")
            focus_areas.append("Pulmonary Evaluation")

    # Analyze questionnaires
    for q_id, score in request.recent_questionnaire_scores.items():
        if "phq" in q_id.lower() and score >= 10:
            abnormal_findings.append(f"Depression screening score elevated ({score}/27)")
            focus_areas.append("Mental Health Support")
        elif "gad" in q_id.lower() and score >= 10:
            abnormal_findings.append(f"Anxiety screening score elevated ({score}/21)")
            focus_areas.append("Anxiety Management")

    if not focus_areas:
        focus_areas.append("Routine preventive maintenance and lifestyle adherence")

    narrative_parts = [
        f"30-day health telemetry summary for patient {request.patient_id}.",
        f"Active clinical conditions on record: {', '.join(request.known_conditions) if request.known_conditions else 'None specified'}.",
    ]

    if abnormal_findings:
        narrative_parts.append(f"Key clinical observations flagged: {'; '.join(abnormal_findings)}.")
    else:
        narrative_parts.append("Continuous vital signs and patient-reported outcomes remained within expected clinical thresholds.")

    return HealthSummaryResponse(
        patient_id=request.patient_id,
        timeframe_days=request.timeframe_days,
        summary_narrative=" ".join(narrative_parts),
        vital_trends=vital_trends,
        abnormal_findings=abnormal_findings,
        suggested_focus_areas=focus_areas,
        generated_at=now_str,
        disclaimer=settings.CLINICAL_DISCLAIMER,
    )

