from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io

from app.database import get_db
from app.dependencies import get_current_user
from app.models.preventiv import Preventiv
from app.models.preventive_item import PreventivItem
from app.schemas.preventiv import PreventivCreate, PreventivOut, PreventivSummary
from app.services.pdf_service import generate_pdf
from app.services.seller_service import normalize_seller, read_seller

router = APIRouter(prefix="/preventiva", tags=["preventiva"])

@router.get("/", response_model=List[PreventivSummary])
def get_preventiva(db: Session = Depends(get_db), _=Depends(get_current_user)):
    preventiva = db.query(Preventiv).order_by(Preventiv.created_at.desc()).all()
    result = []
    for p in preventiva:
        total = sum(item.total for item in p.items)
        result.append(PreventivSummary(
            id=p.id,
            client_name=p.client_name,
            created_at=p.created_at,
            total=total
        ))
    return result

@router.get("/{preventiv_id}", response_model=PreventivOut)
def get_preventiv(preventiv_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    p = db.query(Preventiv).filter(Preventiv.id == preventiv_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Preventivi nuk u gjet")
    p.seller_snapshot = normalize_seller(p.seller_snapshot)
    return p

@router.post("/", response_model=PreventivOut)
def create_preventiv(data: PreventivCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    preventiv = Preventiv(
        client_name=data.client_name,
        seller_snapshot=read_seller()
    )
    db.add(preventiv)
    db.flush()

    for item_data in data.items:
        total = round(item_data.quantity * item_data.price_snapshot, 2)
        item = PreventivItem(
            preventiv_id=preventiv.id,
            product_id=item_data.product_id,
            name_snapshot=item_data.name_snapshot,
            price_snapshot=item_data.price_snapshot,
            image_snapshot=item_data.image_snapshot,
            quantity=item_data.quantity,
            total=total
        )
        db.add(item)

    db.commit()
    db.refresh(preventiv)
    return preventiv

@router.delete("/{preventiv_id}")
def delete_preventiv(preventiv_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    p = db.query(Preventiv).filter(Preventiv.id == preventiv_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Preventivi nuk u gjet")
    db.delete(p)
    db.commit()
    return {"ok": True}

@router.get("/{preventiv_id}/pdf")
def export_pdf(preventiv_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    p = db.query(Preventiv).filter(Preventiv.id == preventiv_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Preventivi nuk u gjet")
    p.seller_snapshot = normalize_seller(p.seller_snapshot)
    pdf_bytes = generate_pdf(p)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=preventiv_{p.id}.pdf"}
    )
