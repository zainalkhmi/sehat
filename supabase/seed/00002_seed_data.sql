-- ============================================================================
-- FUTURE HEALTH - Synthetic Clinical Seed Data & Standard Questionnaires
-- ============================================================================

-- 1. SEED STANDARDIZED CLINICAL QUESTIONNAIRES (FHIR R4)

-- 1.1 PHQ-9 (Patient Health Questionnaire - 9, LOINC 44249-1)
INSERT INTO questionnaires (id, title, description, version, status, items)
VALUES (
    'phq-9',
    'Patient Health Questionnaire - 9 (PHQ-9)',
    'Over the last 2 weeks, how often have you been bothered by any of the following problems? Standard validated depression screening instrument.',
    '1.0.0',
    'active',
    '[
        {"linkId": "1", "text": "Little interest or pleasure in doing things", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "2", "text": "Feeling down, depressed, or hopeless", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "3", "text": "Trouble falling or staying asleep, or sleeping too much", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "4", "text": "Feeling tired or having little energy", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "5", "text": "Poor appetite or overeating", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "6", "text": "Feeling bad about yourself - or that you are a failure or have let yourself or your family down", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "7", "text": "Trouble concentrating on things, such as reading the newspaper or watching television", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "8", "text": "Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "9", "text": "Thoughts that you would be better off dead, or of hurting yourself in some way", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]}
    ]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    items = EXCLUDED.items;

-- 1.2 GAD-7 (General Anxiety Disorder - 7, LOINC 70274-6)
INSERT INTO questionnaires (id, title, description, version, status, items)
VALUES (
    'gad-7',
    'General Anxiety Disorder - 7 (GAD-7)',
    'Over the last 2 weeks, how often have you been bothered by the following problems? Validated generalized anxiety assessment.',
    '1.0.0',
    'active',
    '[
        {"linkId": "1", "text": "Feeling nervous, anxious, or on edge", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "2", "text": "Not being able to stop or control worrying", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "3", "text": "Worrying too much about different things", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "4", "text": "Trouble relaxing", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "5", "text": "Being so restless that it is hard to sit still", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "6", "text": "Becoming easily annoyed or irritable", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]},
        {"linkId": "7", "text": "Feeling afraid, as if something awful might happen", "type": "choice", "options": [{"value": "0", "label": "Not at all", "score": 0}, {"value": "1", "label": "Several days", "score": 1}, {"value": "2", "label": "More than half the days", "score": 2}, {"value": "3", "label": "Nearly every day", "score": 3}]}
    ]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    items = EXCLUDED.items;

-- 2. SEED ORGANIZATIONS
INSERT INTO organizations (id, name, identifier, type)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'RS Jantung Harapan Kita', 'ID-HOSP-001', 'hospital'),
    ('a0000000-0000-0000-0000-000000000002', 'Universitas Indonesia - Biomedical Informatics', 'ID-UNIV-001', 'research-institute')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED RESEARCH PROJECT (IRB Approved Study)
ALTER TABLE IF EXISTS research_projects ALTER COLUMN lead_researcher_id DROP NOT NULL;

INSERT INTO research_projects (
    id,
    title,
    protocol_number,
    description,
    lead_researcher_id,
    organization_id,
    status,
    start_date,
    inclusion_criteria,
    exclusion_criteria
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Longitudinal Cardiovascular & Mental Health Cohort Study',
    'FH-IRB-2026-08',
    'Investigating continuous wearable blood pressure, heart rate variability, and depressive symptoms in ambulatory adults using remote physiological telemetry.',
    NULL,
    'a0000000-0000-0000-0000-000000000002',
    'active',
    '2026-01-01',
    '["Age 18-75", "Owns Apple Watch or compatible BLE monitor", "Signed informed consent under UU PDP"]'::jsonb,
    '["End-stage renal disease", "Active pacemaker with telemetry interference"]'::jsonb
) ON CONFLICT (protocol_number) DO NOTHING;

