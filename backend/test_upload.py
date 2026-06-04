import httpx

SUPABASE_URL = "https://wbdevybtqlioxmesotmc.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZGV2eWJ0cWxpb3htZXNvdG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MjA3NTAsImV4cCI6MjA5NjA5Njc1MH0.p8mwBlsGrzN2OqEWs9VlvOZW6a2hG5a_f1CyhJEifPQ"

response = httpx.post(
    f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
    headers={"apikey": ANON_KEY},
    json={"email": "r63dar-vtm@yahoo.com", "password": "Test1234!"}
)
token = response.json().get("access_token")
print("Token obtenido OK")

foto_path = r"E:\Ruben\Documents\Ruben Arcila\TalentAcademy\Vibe Coder​ Bootcamp\Proyectos_VibeCoding\Mapadeviajes\Fotos ejemplo\2019_03 S E Asia 4679.jpg"

with open(foto_path, "rb") as f:
    files = {"file": ("foto.jpg", f, "image/jpeg")}
    headers = {"Authorization": f"Bearer {token}"}
    result = httpx.post(
        "http://127.0.0.1:8000/images/upload",
        files=files,
        headers=headers,
        timeout=60
    )

print("Status:", result.status_code)
print("Respuesta:", result.json())