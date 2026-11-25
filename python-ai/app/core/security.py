from fastapi import Header, HTTPException, status

from app.core.config import get_settings


async def verify_internal_api_key(x_internal_api_key: str = Header(default="")) -> None:
    settings = get_settings()
    if not x_internal_api_key or x_internal_api_key != settings.internal_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing internal API key")
