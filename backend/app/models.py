from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False, index=True)

    hashed_password = Column(String, nullable=False)

    age = Column(Integer, nullable=True)

    gender = Column(String, nullable=True)

    height = Column(Float, nullable=True)

    weight = Column(Float, nullable=True)

    sport = Column(String, nullable=True)

    experience = Column(Integer, nullable=True)

    videos = relationship("Video", back_populates="owner")


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    filepath = Column(String, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"))

    frames_processed = Column(Integer, default=0)

    pose_detected_frames = Column(Integer, default=0)

    average_knee_angle = Column(Float, default=0)

    injury_risk = Column(String, default="Unknown")

    owner = relationship("User", back_populates="videos")