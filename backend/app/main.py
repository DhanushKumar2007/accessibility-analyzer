from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import endpoints
from app.core.config import settings
import os

app = FastAPI(title="Accessibility Analyzer API")

# 1. FIX: Explicitly list the origins
# Windows sometimes uses 127.0.0.1 instead of localhost
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Use the list instead of "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Ensure directories exist before mounting
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# 3. Include the router AFTER the middleware
app.include_router(endpoints.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    os.makedirs(os.path.join(settings.BASE_DIR, "data"), exist_ok=True)

@app.get("/")
async def root():
    return {"status": "online"}
