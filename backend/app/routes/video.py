from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import shutil
import os

from .. import models
from ..dependencies import get_db
from ..jwt_handler import verify_token
from ..services.pose_estimation import process_video

router = APIRouter(
    prefix="/video",
    tags=["Video"]
)

security = HTTPBearer()

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_current_user(token: str, db: Session):
    payload = verify_token(token)

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


@router.post("/upload")
def upload_video(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user(
        credentials.credentials,
        db
    )

    filepath = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    analysis = process_video(filepath)

    video = models.Video(
        filename=file.filename,
        filepath=filepath,
        owner_id=user.id,
        frames_processed=analysis["frames_processed"],
        pose_detected_frames=analysis["pose_detected_frames"],
        average_knee_angle=analysis["average_knee_angle"],
        injury_risk=analysis["injury_risk"]
    )

    db.add(video)
    db.commit()
    db.refresh(video)

    return {
        "message": "Video Uploaded Successfully",
        "analysis": analysis
    }


@router.get("/my-videos")
def my_videos(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user(
        credentials.credentials,
        db
    )

    videos = db.query(models.Video).filter(
        models.Video.owner_id == user.id
    ).all()

    result = []

    for video in videos:

        result.append({

            "id": video.id,

            "filename": video.filename,

            "filepath": video.filepath,

            "analysis": {

                "frames_processed": video.frames_processed,

                "pose_detected_frames": video.pose_detected_frames,

                "average_knee_angle": video.average_knee_angle,

                "injury_risk": video.injury_risk

            }

        })

    return result