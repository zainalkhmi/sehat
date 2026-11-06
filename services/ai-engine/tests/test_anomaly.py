from app.schemas import AnomalyDetectionRequest, TimeSeriesPoint
from app.anomaly import detect_timeseries_anomalies

def test_anomaly_detection_normal_baseline():
    points = [
        TimeSeriesPoint(timestamp=f"2026-11-05T{h:02d}:00:00Z", value=72.0 + (h % 3))
        for h in range(10)
    ]
    req = AnomalyDetectionRequest(
        patient_id="pt-test-01",
        loinc_code="8867-4",
        display_name="Heart Rate",
        timeseries=points,
        sensitivity=2.5,
    )
    res = detect_timeseries_anomalies(req)
    assert res.total_points == 10
    assert res.anomalies_detected == 0

def test_anomaly_detection_heart_rate_spike():
    points = [
        TimeSeriesPoint(timestamp=f"2026-11-05T{h:02d}:00:00Z", value=70.0)
        for h in range(10)
    ]
    # Inject acute tachycardia spike
    points.append(TimeSeriesPoint(timestamp="2026-11-05T10:30:00Z", value=145.0))

    req = AnomalyDetectionRequest(
        patient_id="pt-test-02",
        loinc_code="8867-4",
        display_name="Heart Rate",
        timeseries=points,
        sensitivity=2.0,
    )
    res = detect_timeseries_anomalies(req)
    assert res.anomalies_detected >= 1
    flagged = [p for p in res.points if p.is_anomaly]
    assert flagged[0].value == 145.0
    assert "Tachycardia" in (flagged[0].reason or "")

def test_anomaly_detection_critical_hypoxemia():
    points = [
        TimeSeriesPoint(timestamp="2026-11-05T08:00:00Z", value=98.0),
        TimeSeriesPoint(timestamp="2026-11-05T09:00:00Z", value=97.0),
        TimeSeriesPoint(timestamp="2026-11-05T10:00:00Z", value=88.0), # Critical SpO2 < 92%
    ]
    req = AnomalyDetectionRequest(
        patient_id="pt-test-03",
        loinc_code="59408-5",
        display_name="Oxygen Saturation",
        timeseries=points,
    )
    res = detect_timeseries_anomalies(req)
    assert res.anomalies_detected >= 1
    flagged = [p for p in res.points if p.is_anomaly]
    assert any("Critical Hypoxemia" in (f.reason or "") for f in flagged)

