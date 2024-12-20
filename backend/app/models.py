from pydantic import BaseModel


class ProteinResponse(BaseModel):
    protein_id: str
    protein_name: str
    description: str
