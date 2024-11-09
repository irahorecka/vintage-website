from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Sample data model
class Item(BaseModel):
    name: str
    description: str = None
    price: float
    in_stock: bool = True

# Sample GET endpoint
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id, "name": "Sample Item"}

# Sample POST endpoint
@app.post("/items/")
async def create_item(item: Item):
    return {"message": "Item created", "item": item}

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

