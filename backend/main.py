from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from supabase import create_client, Client
import cloudinary
import cloudinary.uploader
import os
import io
import secrets
import hashlib
import json
import httpx
import jwt
from jwt.algorithms import ECAlgorithm
from PIL import Image
import piexif
from datetime import datetime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG": "image/png",
    b"RIFF": "image/webp",
}
MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_PIXELS = 25_000_000
UPLOAD_RATE_LIMIT: dict = {}
MAX_UPLOADS_PER_HOUR = 50
PUBLIC_RATE_LIMIT: dict = {}
MAX_PUBLIC_PER_MIN = 60

_public_key_cache = None

def get_signed_url(public_id: str, transformation: str) -> str:
    import cloudinary.utils
    url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        type="private",
        resource_type="image",
        raw_transformation=transformation,
        sign_url=True
    )
    return url

@app.on_event("startup")
async def startup_event():
    global _public_key_cache
    try:
        _public_key_cache = get_supabase_public_key()
        print("Clave pública de Supabase cacheada OK")
    except Exception as e:
        print(f"Advertencia: no se pudo cachear clave pública: {e}")

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

def detect_mime_from_magic(data: bytes) -> str | None:
    for magic, mime in MAGIC_BYTES.items():
        if data[:len(magic)] == magic:
            return mime
    return None

class UserObj:
    def __init__(self, uid: str):
        self.id = uid

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CreateMapRequest(BaseModel):
    name: str
    description: str = ""

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserObj:
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

def verify_map_ownership(map_id: str, user_id: str):
    result = supabase.table("maps")\
        .select("id")\
        .eq("id", map_id)\
        .eq("user_id", user_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Mapa no encontrado")

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
            return datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S").isoformat()
    except Exception:
        pass
    return None

def strip_exif(contents: bytes, mime_type: str) -> bytes:
    if mime_type == "image/jpeg":
        try:
            img = Image.open(io.BytesIO(contents))
            buf = io.BytesIO()
            img.save(buf, format="JPEG", exif=b"")
            return buf.getvalue()
        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"No se pudo eliminar EXIF de la imagen: {str(e)}"
            )
    try:
        img = Image.open(io.BytesIO(contents))
        buf = io.BytesIO()
        fmt = "PNG" if mime_type == "image/png" else "WEBP"
        img.save(buf, format=fmt)
        return buf.getvalue()
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"No se pudo procesar la imagen: {str(e)}"
        )

# ----------------------------------------------------------------
# ENDPOINTS
# ----------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}

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

# ----------------------------------------------------------------
# MAPAS
# ----------------------------------------------------------------

@app.post("/maps")
def create_map(
    data: CreateMapRequest,
    current_user: UserObj = Depends(get_current_user)
):
    result = supabase.table("maps").insert({
        "user_id": current_user.id,
        "name": data.name,
        "description": data.description,
        "is_public": False
    }).execute()
    map_data = result.data[0]
    return {
        "map_id": map_data["id"],
        "name": map_data["name"],
        "is_public": map_data["is_public"],
        "created_at": map_data["created_at"]
    }

@app.get("/maps")
def list_maps(current_user: UserObj = Depends(get_current_user)):
    result = supabase.table("maps")\
        .select("id, name, description, is_public, created_at, updated_at")\
        .eq("user_id", current_user.id)\
        .order("created_at", desc=True)\
        .execute()
    return result.data

@app.delete("/maps/{map_id}")
def delete_map(
    map_id: str,
    current_user: UserObj = Depends(get_current_user)
):
    verify_map_ownership(map_id, current_user.id)
    images = supabase.table("images")\
        .select("cloudinary_public_id")\
        .eq("map_id", map_id)\
        .execute()
    for img in images.data:
        try:
            cloudinary.uploader.destroy(
                img["cloudinary_public_id"],
                resource_type="image",
                type="private"
            )
        except Exception:
            pass
    supabase.table("maps").delete().eq("id", map_id).execute()
    return {"message": "Mapa y sus imágenes eliminados"}

@app.post("/maps/{map_id}/publish")
def publish_map(
    map_id: str,
    current_user: UserObj = Depends(get_current_user)
):
    verify_map_ownership(map_id, current_user.id)
    raw_token = secrets.token_hex(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    supabase.table("maps").update({
        "is_public": True,
        "embed_token_hash": token_hash
    }).eq("id", map_id).execute()
    return {
        "message": "Mapa publicado. Guarda este token — no se puede recuperar.",
        "embed_token": raw_token
    }

@app.post("/maps/{map_id}/unpublish")
def unpublish_map(
    map_id: str,
    current_user: UserObj = Depends(get_current_user)
):
    verify_map_ownership(map_id, current_user.id)
    supabase.table("maps").update({
        "is_public": False,
        "embed_token_hash": None
    }).eq("id", map_id).execute()
    return {"message": "Acceso al mapa revocado"}

# ----------------------------------------------------------------
# IMÁGENES
# ----------------------------------------------------------------

@app.post("/images/upload")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    map_id: str = None,
    current_user: UserObj = Depends(get_current_user)
):
    # Rate limit simple por user_id
    user_id = current_user.id
    now = datetime.utcnow()
    hour_key = f"{user_id}:{now.strftime('%Y%m%d%H')}"
    UPLOAD_RATE_LIMIT[hour_key] = UPLOAD_RATE_LIMIT.get(hour_key, 0) + 1
    if UPLOAD_RATE_LIMIT[hour_key] > MAX_UPLOADS_PER_HOUR:
        raise HTTPException(status_code=429, detail="Límite de uploads por hora alcanzado")

    # Verificar ownership del mapa si se provee map_id
    if map_id:
        verify_map_ownership(map_id, user_id)

    contents = await file.read()

    # Validar tamaño
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Imagen supera el límite de 10 MB.")

    # Validar magic bytes (no confiar en Content-Type del cliente)
    real_mime = detect_mime_from_magic(contents)
    if not real_mime:
        raise HTTPException(status_code=400, detail="Formato no permitido. Usa JPEG, PNG o WEBP.")

    # Validar dimensiones
    try:
        img = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Archivo no es una imagen válida.")
    width, height = img.size
    if width * height > MAX_PIXELS:
        raise HTTPException(status_code=400, detail=f"Imagen supera 25 MP ({width}x{height}).")

    # Extraer EXIF antes de descartar
    lat, lng, taken_at = None, None, None
    try:
        exif_bytes = piexif.load(contents)
        lat, lng = extract_gps(exif_bytes)
        taken_at = extract_taken_at(exif_bytes)
    except Exception:
        pass

    # Descartar EXIF del binario antes de subir
    clean_contents = strip_exif(contents, real_mime)

    # public_id opaco con UUID aleatorio — nunca expone user_id
    image_uuid = secrets.token_hex(16)
    if map_id:
        public_id = f"geomap/{map_id}/{image_uuid}"
    else:
        public_id = f"geomap/unassigned/{image_uuid}"

    # Subir a Cloudinary
    try:
        result = cloudinary.uploader.upload(
            clean_contents,
            public_id=public_id,
            type="private",
            eager=[
                {"width": 400, "height": 300, "crop": "fill",
                 "quality": "auto", "fetch_format": "auto"},
                {"width": 1200, "height": 900, "crop": "limit",
                 "quality": "auto", "fetch_format": "auto"}
            ],
            eager_async=False,
            overwrite=False
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subiendo imagen: {str(e)}")

    # Guardar en BD — nunca devolver cloudinary_public_id al cliente
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
        try:
            cloudinary.uploader.destroy(
                result["public_id"],
                resource_type="image",
                type="private"
            )
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Error guardando en BD: {str(e)}")

    return {
        "message": "Imagen subida correctamente",
        "image_id": image_id,
        "has_gps": lat is not None,
        "lat": lat,
        "lng": lng,
        "taken_at": taken_at
    }

@app.delete("/images/{image_id}")
def delete_image(
    image_id: str,
    current_user: UserObj = Depends(get_current_user)
):
    result = supabase.table("images")\
        .select("cloudinary_public_id")\
        .eq("id", image_id)\
        .eq("user_id", current_user.id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    public_id = result.data[0]["cloudinary_public_id"]
    cloudinary.uploader.destroy(public_id, resource_type="image", type="private")
    supabase.table("images").delete().eq("id", image_id).execute()
    return {"message": "Imagen eliminada"}

# 
# ----------------------------------------------------------------
# ENDPOINTS PRIVADOS — vista del mapa autenticado
# ----------------------------------------------------------------

@app.get("/maps/{map_id}")
def get_map(
    map_id: str,
    current_user: UserObj = Depends(get_current_user)
):
    verify_map_ownership(map_id, current_user.id)
    result = supabase.table("maps")\
        .select("id, name, description, is_public, created_at, updated_at")\
        .eq("id", map_id)\
        .eq("user_id", current_user.id)\
        .single()\
        .execute()
    return result.data

@app.get("/maps/{map_id}/markers")
def get_map_markers(
    map_id: str,
    current_user: UserObj = Depends(get_current_user)
):
    verify_map_ownership(map_id, current_user.id)
    images = supabase.table("images")\
        .select("id, lat, lng, taken_at, filename_original, has_gps, cloudinary_public_id")\
        .eq("map_id", map_id)\
        .eq("user_id", current_user.id)\
        .eq("has_gps", True)\
        .limit(200)\
        .execute()
    markers = []
    for img in images.data:
        thumb_url = get_signed_url(
            img["cloudinary_public_id"],
            "w_400,h_300,c_fill,q_auto,f_auto"
        )
        full_url = get_signed_url(
            img["cloudinary_public_id"],
            "w_1200,h_900,c_limit,q_auto,f_auto"
        )
        markers.append({
            "image_id": img["id"],
            "lat": img["lat"],
            "lng": img["lng"],
            "taken_at": img["taken_at"],
            "filename": img["filename_original"],
            "thumb_url": thumb_url,
            "full_url": full_url
        })
    return {"markers": markers}

@app.get("/maps/{map_id}/images/unlocated")
def get_unlocated_images(
    map_id: str,
    current_user: UserObj = Depends(get_current_user)
):
    verify_map_ownership(map_id, current_user.id)
    images = supabase.table("images")\
        .select("id, filename_original, taken_at, cloudinary_public_id")\
        .eq("map_id", map_id)\
        .eq("user_id", current_user.id)\
        .eq("has_gps", False)\
        .execute()
    result = []
    for img in images.data:
        thumb_url = get_signed_url(
            img["cloudinary_public_id"],
            "w_400,h_300,c_fill,q_auto,f_auto"
        )
        result.append({
            "image_id": img["id"],
            "filename": img["filename_original"],
            "taken_at": img["taken_at"],
            "thumb_url": thumb_url
        })
    return {"images": result}

@app.patch("/images/{image_id}/location")
def update_image_location(
    image_id: str,
    lat: float,
    lng: float,
    current_user: UserObj = Depends(get_current_user)
):
    result = supabase.table("images")\
        .select("id")\
        .eq("id", image_id)\
        .eq("user_id", current_user.id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    supabase.table("images").update({
        "lat": round(lat, 7),
        "lng": round(lng, 7),
        "has_gps": True
    }).eq("id", image_id).execute()
    return {"message": "Ubicación actualizada", "lat": lat, "lng": lng}

@app.get("/maps/{map_id}/embed/access-log")
def get_access_log(
    map_id: str,
    current_user: UserObj = Depends(get_current_user)
):
    verify_map_ownership(map_id, current_user.id)
    logs = supabase.table("embed_access_log")\
        .select("accessed_at, user_agent_short")\
        .eq("map_id", map_id)\
        .order("accessed_at", desc=True)\
        .limit(50)\
        .execute()
    return {"logs": logs.data}




#------------------------------------------------
# ENDPOINT PÚBLICO — embed
# -----------------------------------------------

@app.get("/api/public/markers")
async def public_markers(token: str, request: Request):
# Rate limit por IP — 60 requests/min
    ip = request.client.host
    now = datetime.utcnow()
    min_key = f"{ip}:{now.strftime('%Y%m%d%H%M')}"
    PUBLIC_RATE_LIMIT[min_key] = PUBLIC_RATE_LIMIT.get(min_key, 0) + 1
    if PUBLIC_RATE_LIMIT[min_key] > MAX_PUBLIC_PER_MIN:
        raise HTTPException(status_code=429, detail="Rate limit excedido")

    # Validar token
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    map_result = supabase.table("maps")\
        .select("id")\
        .eq("embed_token_hash", token_hash)\
        .eq("is_public", True)\
        .execute()
    if not map_result.data:
        raise HTTPException(status_code=403, detail="Token inválido o mapa no público")

    map_id = map_result.data[0]["id"]

    # Log de acceso con IP hasheada
    ip = request.client.host
    ip_hash = hashlib.sha256(ip.encode()).hexdigest()
    supabase.table("embed_access_log").insert({
        "map_id": map_id,
        "ip_hash": ip_hash,
        "user_agent_short": request.headers.get("user-agent", "")[:100]
    }).execute()

    # Devolver lat/lng/taken_at/thumb_url — nunca public_id, id ni user_id
    images = supabase.table("images")\
        .select("cloudinary_public_id, lat, lng, taken_at")\
        .eq("map_id", map_id)\
        .eq("has_gps", True)\
        .limit(200)\
        .execute()

    markers = []
    for img in images.data:
        thumb_url = get_signed_url(
            img["cloudinary_public_id"],
            "w_400,h_300,c_fill,q_auto,f_auto"
        )
        full_url = get_signed_url(
            img["cloudinary_public_id"],
            "w_1200,h_900,c_limit,q_auto,f_auto"
        )
        markers.append({
            "lat": img["lat"],
            "lng": img["lng"],
            "taken_at": img["taken_at"],
            "thumb_url": thumb_url,
            "full_url": full_url
        })

    return {"markers": markers}