from fastapi import APIRouter, HTTPException
import aiofiles
from pathlib import Path

router = APIRouter()


@router.get("/{filename}")
async def read_file(filename: str):
    file_path = Path("static/files") / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    async with aiofiles.open(file_path, mode="r") as file:
        content = await file.read()
    return {"filename": filename, "content": content}
