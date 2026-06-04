from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="GeoMap API", version="1.0.0")

@app.get("/")
def root():
    return {"status": "ok", "message": "GeoMap API funcionando"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "supabase_url": os.getenv("SUPABASE_URL", "no configurada")
    }