from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PreventivItem(Base):
    __tablename__ = "preventiv_items"

    id = Column(Integer, primary_key=True, index=True)
    preventiv_id = Column(Integer, ForeignKey("preventivas.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

    name_snapshot = Column(String, nullable=False)
    price_snapshot = Column(Float, nullable=False)
    image_snapshot = Column(String, nullable=True)
    quantity = Column(Integer, nullable=False)
    total = Column(Float, nullable=False)

    preventiv = relationship("Preventiv", back_populates="items")