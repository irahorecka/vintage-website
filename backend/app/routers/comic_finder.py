"""
backend/app/routers/comic_finder
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
"""

import os

import aiohttp
import comics
from fastapi import APIRouter, HTTPException, Query
from rapidfuzz import process

router = APIRouter()

# Directory to save downloaded comics
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Current file's directory
FULL_COMICS_DIR = os.path.abspath(
    os.path.join(BASE_DIR, "..", "static", "images", "comics_storage")
)
# Ensure the directory exists
os.makedirs(FULL_COMICS_DIR, exist_ok=True)

AVAILABLE_COMICS = {}


@router.on_event("startup")
async def load_comics():
    """Load comics data from the provided URL on startup."""
    global AVAILABLE_COMICS
    url = "https://raw.githubusercontent.com/irahorecka/comics/refs/heads/main/src/comics/_constants/_endpoints.json"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                try:
                    data = await response.json(content_type=None)
                    AVAILABLE_COMICS.update({key: value["title"] for key, value in data.items()})
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"Failed to parse JSON: {str(e)}")


@router.get("/comics")
async def list_comics():
    """
    List all available comics in a human-readable format.

    Returns:
        dict: All available comic titles.
    """
    return {"available_comics": list(AVAILABLE_COMICS.values())}


@router.get("/comics/fuzzy-search")
async def fuzzy_search(comic_name: str = Query(..., min_length=1)):
    """
    Fuzzy search for comic names using the comics directory.

    Args:
        comic_name (str): User input to search for a comic.

    Returns:
        dict: List of top matches with similarity scores.
    """
    matches = process.extract(comic_name, AVAILABLE_COMICS.keys(), limit=5, score_cutoff=60)
    if not matches:
        raise HTTPException(status_code=404, detail="No matching comics found.")

    return {"matches": [AVAILABLE_COMICS[name] for name, score, _ in matches]}


@router.get("/comics/search")
async def fetch_comic(comic: str, date: str = None):
    """Fetch and save a comic strip based on the title and date.

    Args:
        comic (str): Human-readable comic name.
        date (str): Optional date in "YYYY-MM-DD" format.

    Returns:
        dict: Details of the saved comic, including the file path.
    """
    # Validate comic
    print([key for key, title in AVAILABLE_COMICS.items()])
    comic_key = next((key for key, title in AVAILABLE_COMICS.items() if title == comic), None)
    if not comic_key:
        raise HTTPException(status_code=400, detail=f"Comic '{comic}' not found.")

    try:
        # Fetch comic instance and handle random vs specific date
        if date:
            comic_instance = comics.search(comic_key, date=date)
            date = date.replace("-", "")  # Remove hyphens for filename consistency
        else:
            comic_instance = comics.search(comic_key, date="random")
            # Retrieve the date from the instance after fetching
            date = comic_instance.date.replace("-", "")

        # Generate a unique filename using the resolved date
        filename = f"{comic_key}_{date}.webp"
        download_file_path = os.path.join(FULL_COMICS_DIR, filename)

        # Check if the file already exists (only for specific dates)
        if not os.path.exists(download_file_path):
            comic_instance.download(download_file_path, retries=3, base_delay=0.5)

        return {
            "comic": comic,
            "date": date,
            "file_path": f"static/images/comics_storage/{filename}",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comic: {str(e)}")
