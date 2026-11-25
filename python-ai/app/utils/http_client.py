import os
import uuid

import httpx

from app.core.config import get_settings


class DownloadError(Exception):
    pass


async def download_to_bytes(url: str) -> bytes:
    settings = get_settings()
    max_bytes = settings.max_download_size_mb * 1024 * 1024

    async with httpx.AsyncClient(timeout=settings.download_timeout_seconds, follow_redirects=True) as client:
        async with client.stream("GET", url) as response:
            if response.status_code != 200:
                raise DownloadError(f"Failed to download source file (HTTP {response.status_code})")

            chunks = []
            total = 0
            async for chunk in response.aiter_bytes(chunk_size=65536):
                total += len(chunk)
                if total > max_bytes:
                    raise DownloadError("Source file exceeds the maximum allowed download size")
                chunks.append(chunk)

    return b"".join(chunks)


async def download_to_tmp_file(url: str, suffix: str = "") -> str:
    settings = get_settings()
    os.makedirs(settings.tmp_dir, exist_ok=True)

    data = await download_to_bytes(url)
    file_path = os.path.join(settings.tmp_dir, f"{uuid.uuid4().hex}{suffix}")
    with open(file_path, "wb") as f:
        f.write(data)
    return file_path


def cleanup_file(file_path: str) -> None:
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except OSError:
        pass
