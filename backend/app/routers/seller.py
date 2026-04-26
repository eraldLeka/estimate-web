from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.dependencies import get_current_user
from app.services.seller_service import DEFAULT_SELLER_NAME, read_seller, write_seller

router = APIRouter(prefix="/seller", tags=["seller"])

class SellerInfo(BaseModel):
    name: str = DEFAULT_SELLER_NAME
    phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""

@router.get("/", response_model=SellerInfo)
def get_seller(_=Depends(get_current_user)):
    return read_seller()

@router.put("/", response_model=SellerInfo)
def update_seller(data: SellerInfo, _=Depends(get_current_user)):
    return write_seller(data.model_dump())
