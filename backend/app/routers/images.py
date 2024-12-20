from fastapi import APIRouter
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter()


@router.get("/{image_name}")
async def get_image(image_name: str):
    image_path = Path("static/images") / image_name
    if not image_path.exists():
        return {"error": "Image not found"}
    return FileResponse(image_path)
