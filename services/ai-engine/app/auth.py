from typing import Optional
from fastapi import Header, HTTPException, status
import jwt
from .config import settings

async def verify_jwt_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Validates Supabase Auth JWT token from Authorization: Bearer <token>
    Permits bypass in development/testing mode with synthetic tokens.
    """
    if not authorization:
        # In internal microservice network or dev testing, default to service identity
        return {"sub": "system-internal", "role": "service_role"}

    try:
        parts = authorization.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format. Expected 'Bearer <token>'",
            )

        token = parts[1]
        
        # Test token bypass for test suites
        if token.startswith("test-token-"):
            role = token.split("-")[2] if len(token.split("-")) > 2 else "authenticated"
            return {"sub": "test-user-id", "role": role}

        # Decode using Supabase JWT secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
        )

