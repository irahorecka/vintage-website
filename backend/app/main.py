from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routers import comic_finder, images, protein_explorer
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(comic_finder.router, prefix="/api", tags=["Comic Finder"])
app.include_router(images.router, prefix="/images", tags=["Images"])
app.include_router(protein_explorer.router, prefix="/api", tags=["Protein Explorer"])


app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
async def root():
    return {"message": "Welcome to the backend!"}
