from fastapi import APIRouter

router = APIRouter()


@router.get("/data")
async def get_data():
    return {"status": "success", "data": {"key1": "value1", "key2": "value2"}}
