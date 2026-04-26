from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Preventiv(Base):
    __tablename__ = "preventivas"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    seller_snapshot = Column(JSON, nullable=False)

    items = relationship("PreventivItem", back_populates="preventiv", cascade="all, delete-orphan")