from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


# ============================================================
# USER MODEL
# ============================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    hashed_password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False,
        default="Athlete"
    )

    # ========================================================
    # ATHLETE INFORMATION
    # ========================================================

    age = Column(
        Integer,
        nullable=True
    )

    gender = Column(
        String,
        nullable=True
    )

    height = Column(
        Float,
        nullable=True
    )

    weight = Column(
        Float,
        nullable=True
    )

    sport = Column(
        String,
        nullable=True
    )

    experience = Column(
        Integer,
        nullable=True
    )

    # ========================================================
    # ACCEPTED COACH CONNECTION
    # ========================================================

    coach_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    # ========================================================
    # ACCEPTED PHYSIOTHERAPIST CONNECTION
    # ========================================================

    physio_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    # ========================================================
    # VIDEO RELATIONSHIP
    # ========================================================

    videos = relationship(
        "Video",
        back_populates="owner"
    )

    # ========================================================
    # COACH ↔ ATHLETE RELATIONSHIP
    # ========================================================

    assigned_athletes = relationship(
        "User",
        foreign_keys="User.coach_id",
        back_populates="coach"
    )

    coach = relationship(
        "User",
        foreign_keys=[coach_id],
        remote_side=[id],
        back_populates="assigned_athletes"
    )

    # ========================================================
    # PHYSIOTHERAPIST ↔ ATHLETE RELATIONSHIP
    # ========================================================

    assigned_physio_athletes = relationship(
        "User",
        foreign_keys="User.physio_id",
        back_populates="physio"
    )

    physio = relationship(
        "User",
        foreign_keys=[physio_id],
        remote_side=[id],
        back_populates="assigned_physio_athletes"
    )

    # ========================================================
    # CONNECTION REQUESTS SENT BY THIS USER
    # ========================================================

    sent_connection_requests = relationship(
        "ConnectionRequest",
        foreign_keys="ConnectionRequest.athlete_id",
        back_populates="athlete"
    )

    # ========================================================
    # CONNECTION REQUESTS RECEIVED BY THIS USER
    # ========================================================

    received_connection_requests = relationship(
        "ConnectionRequest",
        foreign_keys="ConnectionRequest.professional_id",
        back_populates="professional"
    )


# ============================================================
# CONNECTION REQUEST MODEL
# ============================================================

class ConnectionRequest(Base):

    __tablename__ = "connection_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # --------------------------------------------------------
    # Athlete sending the request
    # --------------------------------------------------------

    athlete_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # --------------------------------------------------------
    # Coach / Physiotherapist receiving request
    # --------------------------------------------------------

    professional_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # --------------------------------------------------------
    # Role of receiving professional
    # --------------------------------------------------------

    professional_role = Column(
        String,
        nullable=False
    )

    # --------------------------------------------------------
    # Request status
    # --------------------------------------------------------

    status = Column(
        String,
        nullable=False,
        default="pending"
    )

    # --------------------------------------------------------
    # Creation time
    # --------------------------------------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # ========================================================
    # RELATIONSHIP TO ATHLETE
    # ========================================================

    athlete = relationship(
        "User",
        foreign_keys=[athlete_id],
        back_populates="sent_connection_requests"
    )

    # ========================================================
    # RELATIONSHIP TO COACH / PHYSIO
    # ========================================================

    professional = relationship(
        "User",
        foreign_keys=[professional_id],
        back_populates="received_connection_requests"
    )


# ============================================================
# VIDEO MODEL
# ============================================================

class Video(Base):

    __tablename__ = "videos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    filename = Column(
        String,
        nullable=False
    )

    filepath = Column(
        String,
        nullable=False
    )

    owner_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    # ========================================================
    # VIDEO PROCESSING
    # ========================================================

    frames_processed = Column(
        Integer,
        default=0
    )

    pose_detected_frames = Column(
        Integer,
        default=0
    )

    # ========================================================
    # KNEE
    # ========================================================

    left_knee_angle = Column(
        Float,
        default=0
    )

    right_knee_angle = Column(
        Float,
        default=0
    )

    # ========================================================
    # HIP
    # ========================================================

    left_hip_angle = Column(
        Float,
        default=0
    )

    right_hip_angle = Column(
        Float,
        default=0
    )

    # ========================================================
    # SHOULDER
    # ========================================================

    left_shoulder_angle = Column(
        Float,
        default=0
    )

    right_shoulder_angle = Column(
        Float,
        default=0
    )

    # ========================================================
    # ELBOW
    # ========================================================

    left_elbow_angle = Column(
        Float,
        default=0
    )

    right_elbow_angle = Column(
        Float,
        default=0
    )

    # ========================================================
    # ANALYSIS
    # ========================================================

    posture_symmetry = Column(
        Float,
        default=0
    )

    movement_quality = Column(
        String,
        default="Unknown"
    )

    injury_risk = Column(
        String,
        default="Unknown"
    )

    recommendation = Column(
        String,
        default=""
    )

    # ========================================================
    # OWNER
    # ========================================================

    owner = relationship(
        "User",
        back_populates="videos"
    )