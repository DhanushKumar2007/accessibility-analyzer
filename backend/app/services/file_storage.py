import os
from datetime import datetime
from fastapi import UploadFile
from app.core.config import settings

class FileStorage:
    
    @staticmethod
    async def save_file(file: UploadFile) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        
        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        
        return file_path
    
    @staticmethod
    def delete_file(file_path: str):
        if os.path.exists(file_path):
            os.remove(file_path)
    
    @staticmethod
    def get_file_url(file_path: str) -> str:
        return f"/uploads/{os.path.basename(file_path)}"
