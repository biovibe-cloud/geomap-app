from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from supabase import create_client, Client
import cloudinary
import cloudinary.uploader
import os
import io
import hashlib
import json
import httpx
import jwt
from jwt.algorithms import ECAlgorithm
from PIL import Image
import piexif

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

app = FastAPI(title="GeoMap API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_PIXELS = 25_000_000

_public_key_cache = None

def get_supabase_public_key():
    global _public_key_cache
    if _public_key_cache:
        return _public_key_cache
    jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    response = httpx.get(jwks_url)
    jwks = response.json()
    for key in jwks.get("keys", []):
        _public_key_cache = ECAlgorithm.from_jwk(json.dumps(key))
        return _public_key_cache
    raise Exception("No se encontró clave pública en Supabase")

class UserObj:
    def __init__(self, uid):
        self.id = uid

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        public_key = get_supabase_public_key()
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["ES256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token sin usuario")
        return UserObj(user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")

def extract_gps(exif_data: dict):
    try:
        gps = exif_data.get("GPS", {})
        if not gps:
            return None, None
        def to_degrees(values):
            d = values[0][0] / values[0][1]
            m = values[1][0] / values[1][1]
            s = values[2][0] / values[2][1]
            return d + (m / 60.0) + (s / 3600.0)
        lat = to_degrees(gps[piexif.GPSIFD.GPSLatitude])
        lng = to_degrees(gps[piexif.GPSIFD.GPSLongitude])
        if gps.get(piexif.GPSIFD.GPSLatitudeRef) == b"S":
            lat = -lat
        if gps.get(piexif.GPSIFD.GPSLongitudeRef) == b"W":
            lng = -lng
        return round(lat, 7), round(lng, 7)
    except Exception:
        return None, None

def extract_taken_at(exif_data: dict):
    try:
        exif = exif_data.get("Exif", {})
        date_str = exif.get(piexif.ExifIFD.DateTimeOriginal, b"").decode()
        if date_str:
            from datetime import datetime
            return datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S").isoformat()
    except Exception:
        pass
    return None

@app.get("/")
def root():
    return {"status": "ok", "message": "GeoMap API funcionando"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "supabase_url": SUPABASE_URL,
        "cloudinary": os.getenv("CLOUDINARY_CLOUD_NAME", "no configurado")
    }

@app.post("/auth/register")
def register(data: RegisterRequest):
    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
        return {
            "message": "Usuario registrado. Revisa tu email para confirmar.",
            "user_id": response.user.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
def login(data: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        return {
            "access_token": response.session.access_token,
            "user_id": response.user.id,
            "email": response.user.email
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/images/upload")
async def upload_image(
    file: UploadFile = File(...),
    map_id: str = None,
    current_user: UserObj = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Formato no permitido. Usa JPEG, PNG o WEBP.")

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Imagen supera el límite de 10 MB.")

    try:
        img = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Archivo no es una imagen válida.")

    width, height = img.size
    if width * height > MAX_PIXELS:
        raise HTTPException(status_code=400, detail=f"Imagen supera 25 MP ({width}x{height}).")

    lat, lng, taken_at = None, None, None
    try:
        exif_bytes = piexif.load(contents)
        lat, lng = extract_gps(exif_bytes)
        taken_at = extract_taken_at(exif_bytes)
    except Exception:
        pass

    image_uuid = hashlib.md5(contents).hexdigest()
    user_id = current_user.id

    if map_id:
        public_id = f"geomap/{map_id}/{image_uuid}"
    else:
        public_id = f"geomap/default/{user_id[:8]}/{image_uuid}"

    try:
        result = cloudinary.uploader.upload(
            contents,
            public_id=public_id,
            type="private",
            eager=[
                {"width": 400, "height": 300, "crop": "fill", "quality": "auto", "fetch_format": "auto"},
                {"width": 1200, "height": 900, "crop": "limit", "quality": "auto", "fetch_format": "auto"}
            ],
            eager_async=False,
            overwrite=False
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subiendo a Cloudinary: {str(e)}")

    image_data = {
        "user_id": user_id,
        "map_id": map_id,
        "cloudinary_public_id": result["public_id"],
        "filename_original": file.filename,
        "lat": lat,
        "lng": lng,
        "taken_at": taken_at,
        "has_gps": lat is not None
    }

    try:
        db_result = supabase.table("images").insert(image_data).execute()
        image_id = db_result.data[0]["id"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando en BD: {str(e)}")

    return {
        "message": "Imagen subida correctamente",
        "image_id": image_id,
        "has_gps": lat is not None,
        "lat": lat,
        "lng": lng,
        "taken_at": taken_at,
        "cloudinary_public_id": result["public_id"]
    }