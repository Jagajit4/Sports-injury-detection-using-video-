from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .. import models
from ..dependencies import get_db
from ..jwt_handler import verify_token


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

security = HTTPBearer()


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials,
    db: Session
):

    payload = verify_token(credentials.credentials)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )

    user = db.query(models.User).filter(
        models.User.email == payload["sub"]
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ============================================================
# VERIFY ADMIN
# ============================================================

def verify_admin(
    credentials: HTTPAuthorizationCredentials,
    db: Session
):

    user = get_current_user(credentials, db)

    if user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@router.get("/dashboard")
def admin_dashboard(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    verify_admin(credentials, db)

    total_users = db.query(models.User).count()

    total_athletes = db.query(models.User).filter(
        models.User.role == "Athlete"
    ).count()

    total_coaches = db.query(models.User).filter(
        models.User.role == "Coach"
    ).count()

    total_physios = db.query(models.User).filter(
        models.User.role == "Physiotherapist"
    ).count()

    total_admins = db.query(models.User).filter(
        models.User.role == "Admin"
    ).count()

    total_videos = db.query(models.Video).count()

    high_risk = db.query(models.Video).filter(
        models.Video.injury_risk == "HIGH"
    ).count()

    medium_risk = db.query(models.Video).filter(
        models.Video.injury_risk == "MEDIUM"
    ).count()

    low_risk = db.query(models.Video).filter(
        models.Video.injury_risk == "LOW"
    ).count()

    return {
        "total_users": total_users,
        "total_athletes": total_athletes,
        "total_coaches": total_coaches,
        "total_physios": total_physios,
        "total_admins": total_admins,
        "total_videos": total_videos,
        "risk_distribution": {
            "high": high_risk,
            "medium": medium_risk,
            "low": low_risk
        }
    }


# ============================================================
# ALL REGISTERED USERS
# ============================================================

@router.get("/users")
def get_users(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    verify_admin(credentials, db)

    users = db.query(models.User).order_by(
        models.User.id
    ).all()

    results = []

    for user in users:

        results.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "age": user.age,
            "gender": user.gender,
            "sport": user.sport,
            "experience": user.experience,
            "coach_id": user.coach_id,
            "physio_id": user.physio_id
        })

    return results


# ============================================================
# ALL ANALYZED VIDEOS
# ============================================================

@router.get("/videos")
def get_all_videos(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    verify_admin(credentials, db)

    videos = db.query(models.Video).order_by(
        models.Video.id.desc()
    ).all()

    results = []

    for video in videos:

        owner = db.query(models.User).filter(
            models.User.id == video.owner_id
        ).first()

        results.append({
            "id": video.id,
            "filename": video.filename,
            "owner_id": video.owner_id,
            "owner_username": owner.username if owner else "Unknown",
            "frames_processed": video.frames_processed,
            "pose_detected_frames": video.pose_detected_frames,
            "movement_quality": video.movement_quality,
            "injury_risk": video.injury_risk,
            "posture_symmetry": video.posture_symmetry,
            "recommendation": video.recommendation
        })

    return results


# ============================================================
# ATHLETES
# ============================================================

@router.get("/athletes")
def get_athletes(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    verify_admin(credentials, db)

    athletes = db.query(models.User).filter(
        models.User.role == "Athlete"
    ).order_by(
        models.User.id
    ).all()

    return [
        {
            "id": athlete.id,
            "username": athlete.username,
            "email": athlete.email,
            "sport": athlete.sport,
            "age": athlete.age,
            "gender": athlete.gender,
            "experience": athlete.experience,
            "coach_id": athlete.coach_id,
            "physio_id": athlete.physio_id
        }
        for athlete in athletes
    ]


# ============================================================
# COACHES
# ============================================================

@router.get("/coaches")
def get_coaches(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    verify_admin(credentials, db)

    coaches = db.query(models.User).filter(
        models.User.role == "Coach"
    ).order_by(
        models.User.id
    ).all()

    return [
        {
            "id": coach.id,
            "username": coach.username,
            "email": coach.email
        }
        for coach in coaches
    ]


# ============================================================
# PHYSIOTHERAPISTS
# ============================================================

@router.get("/physios")
def get_physios(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    verify_admin(credentials, db)

    physios = db.query(models.User).filter(
        models.User.role == "Physiotherapist"
    ).order_by(
        models.User.id
    ).all()

    return [
        {
            "id": physio.id,
            "username": physio.username,
            "email": physio.email
        }
        for physio in physios
    ]