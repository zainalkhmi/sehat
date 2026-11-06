import os

class Settings:
    PROJECT_NAME: str = "Future Health AI Clinical Screening Microservice"
    VERSION: str = "1.0.0"
    MODEL_VERSION: str = "clinical-risk-v1.4"
    API_V1_STR: str = "/api/v1"
    
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "http://localhost:54321")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "super-secret-jwt-token-with-at-least-32-characters-long")
    
    # Medical Disclaimer mandated by health regulations
    CLINICAL_DISCLAIMER: str = (
        "FOR CLINICAL DECISION SUPPORT ONLY. NOT A DIAGNOSTIC DEVICE. "
        "All screening outputs must be reviewed, verified, and validated by a licensed healthcare provider "
        "before making treatment decisions or communicating diagnoses to patients."
    )

settings = Settings()

