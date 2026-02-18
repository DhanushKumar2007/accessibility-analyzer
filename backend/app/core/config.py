import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Accessibility Analyzer"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'data', 'accessibility.db')}"
    
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "data", "uploads")
    
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        case_sensitive = True

settings = Settings()

os.makedirs(os.path.join(settings.BASE_DIR, "data"), exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
