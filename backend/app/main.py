"""
backend/app/main
~~~~~~~~~~~~~~~~
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from fastapi.staticfiles import StaticFiles

from app.routers import abstract_syntax_tree, comic_finder, protein_explorer

# Directory to fetch static text files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Current file's directory

# Create the FastAPI instance
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(protein_explorer.router, prefix="/api", tags=["Protein Explorer"])
app.include_router(comic_finder.router, prefix="/api", tags=["Comic Finder"])
app.include_router(abstract_syntax_tree.router, prefix="/api", tags=["AST Generator"])

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/humans.txt", response_class=PlainTextResponse)
async def humans_txt():
    file_path = os.path.join(BASE_DIR, "text", "humans.txt")
    try:
        with open(file_path, "r") as file:
            return file.read()
    except FileNotFoundError:
        return PlainTextResponse("humans.txt not found.", status_code=404)
