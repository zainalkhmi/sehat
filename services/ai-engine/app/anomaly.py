import numpy as np
from typing import List
from .schemas import AnomalyDetectionRequest, AnomalyDetectionResponse, AnomalyPoint

def detect_timeseries_anomalies(request: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
    points = request.timeseries
    if not points:
        return AnomalyDetectionResponse(
            patient_id=request.patient_id,
            loinc_code=request.loinc_code,
            display_name=request.display_name,
            total_points=0,
            anomalies_detected=0,
            points=[],
            summary="No time series data points provided.",
        )

    values = np.array([p.value for p in points], dtype=float)
    mean = float(np.mean(values))
    std = float(np.std(values))
    if std == 0.0:
        std = 1e-6  # Avoid division by zero

    anomaly_points: List[AnomalyPoint] = []
    anomalies_count = 0

    for p in points:
        z = (p.value - mean) / std
        is_statistical_anomaly = abs(z) >= request.sensitivity
        is_clinical_anomaly = False
        reasons = []

        # Domain-specific physiological sanity bounds
        if "8867-4" in request.loinc_code:  # Heart rate
            if p.value > 130:
                is_clinical_anomaly = True
                reasons.append(f"Marked Tachycardia ({p.value} bpm)")
            elif p.value < 45:
                is_clinical_anomaly = True
                reasons.append(f"Marked Bradycardia ({p.value} bpm)")
        elif "59408-5" in request.loinc_code:  # SpO2
            if p.value < 92:
                is_clinical_anomaly = True
                reasons.append(f"Critical Hypoxemia ({p.value}%)")
            elif p.value < 95:
                is_clinical_anomaly = True
                reasons.append(f"Low Oxygen Saturation ({p.value}%)")
        elif "8480-6" in request.loinc_code:  # Systolic BP
            if p.value >= 170:
                is_clinical_anomaly = True
                reasons.append(f"Severe Hypertension Spike ({p.value} mmHg)")

        if is_statistical_anomaly:
            reasons.append(f"Statistical outlier (|z| = {round(abs(z), 2)} >= {request.sensitivity})")

        is_flagged = is_statistical_anomaly or is_clinical_anomaly
        if is_flagged:
            anomalies_count += 1

        anomaly_points.append(
            AnomalyPoint(
                timestamp=p.timestamp,
                value=p.value,
                z_score=round(z, 3),
                is_anomaly=is_flagged,
                reason="; ".join(reasons) if reasons else None,
            )
        )

    summary = (
        f"Analyzed {len(points)} {request.display_name} points. "
        f"Mean: {round(mean, 2)}, StdDev: {round(std, 2)}. "
        f"Identified {anomalies_count} anomalous readings."
    )

    return AnomalyDetectionResponse(
        patient_id=request.patient_id,
        loinc_code=request.loinc_code,
        display_name=request.display_name,
        total_points=len(points),
        anomalies_detected=anomalies_count,
        points=anomaly_points,
        summary=summary,
    )

