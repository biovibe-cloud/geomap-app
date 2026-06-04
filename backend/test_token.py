import httpx
import jwt
from jwt.algorithms import ECAlgorithm
import json

SUPABASE_URL = "https://wbdevybtqlioxmesotmc.supabase.co"

response = httpx.post(
    f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
    headers={"apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZGV2eWJ0cWxpb3htZXNvdG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MjA3NTAsImV4cCI6MjA5NjA5Njc1MH0.p8mwBlsGrzN2OqEWs9VlvOZW6a2hG5a_f1CyhJEifPQ"},
    json={"email": "r63dar-vtm@yahoo.com", "password": "Test1234!"}
)

data = response.json()
token = data.get("access_token")
print("Token obtenido:", token[:50], "...")

jwks = httpx.get(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json").json()
public_key = ECAlgorithm.from_jwk(json.dumps(jwks["keys"][0]))

payload = jwt.decode(token, public_key, algorithms=["ES256"], options={"verify_aud": False})
print("Usuario:", payload.get("sub"))
print("OK - Token válido")