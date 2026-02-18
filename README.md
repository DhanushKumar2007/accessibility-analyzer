Go to backend
Create venv: python -m venv venv
Activate venv: .\venv\Scripts\activate
Install: pip install fastapi uvicorn sqlalchemy pydantic-settings python-multipart Pillow
Run: uvicorn app.main:app --reload

Go to frontend
Install: npm install
Run: npm run dev