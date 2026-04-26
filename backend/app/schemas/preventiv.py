from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class PreventivItemCreate(BaseModel):
    product_id: Optional[int] = None
    name_snapshot: str
    price_snapshot: float
    image_snapshot: Optional[str] = None
    quantity: int

class PreventivItemOut(BaseModel):
    id: int
    product_id: Optional[int]
    name_snapshot: str
    price_snapshot: float
    image_snapshot: Optional[str]
    quantity: int
    total: float

    class Config:
        from_attributes = True

class PreventivCreate(BaseModel):
    client_name: str
    items: List[PreventivItemCreate]

class PreventivOut(BaseModel):
    id: int
    client_name: str
    created_at: datetime
    seller_snapshot: Any
    items: List[PreventivItemOut]

    class Config:
        from_attributes = True

class PreventivSummary(BaseModel):
    id: int
    client_name: str
    created_at: datetime
    total: float

    class Config:
        from_attributes = True