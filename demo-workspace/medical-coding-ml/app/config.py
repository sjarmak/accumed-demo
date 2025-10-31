import os

class Config:
    """Application configuration"""
    
    # Database configuration - loaded from environment
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is required")
    
    # Model configuration
    MODEL_PATH = os.getenv("MODEL_PATH", "/models/icd10_classifier.pkl")
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.75"))
    
    # API settings
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def validate(cls):
        """Validate configuration"""
        if not cls.MODEL_PATH or not os.path.exists(cls.MODEL_PATH):
            raise ValueError(f"Model path {cls.MODEL_PATH} does not exist")
