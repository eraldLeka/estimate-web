from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    name: str
    price: float

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None

class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    image_path: Optional[str] = None

    class Config:
        from_attributes = True