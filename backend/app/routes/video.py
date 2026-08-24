from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from sqlalchemy.orm import Session

import shutil
import os
import uuid

from .. import models
from ..dependencies import get_db
from ..jwt_handler import verify_token
from ..services.pose_estimation import process_video


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/video",
    tags=["Video"]
)

security = HTTPBearer()


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    email = payload.get("sub")

    if not email:

        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    user = db.query(
        models.User
    ).filter(
        models.User.email == email
    ).first()

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ============================================================
# FORMAT VIDEO RESPONSE
# ============================================================

def format_video(video):

    # --------------------------------------------------------
    # Calculate average knee angle
    # --------------------------------------------------------

    left_knee = float(
        video.left_knee_angle or 0
    )

    right_knee = float(
        video.right_knee_angle or 0
    )

    average_knee = round(
        (left_knee + right_knee) / 2,
        2
    )

    # --------------------------------------------------------
    # Owner
    # --------------------------------------------------------

    owner = video.owner

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "id": video.id,

        "filename": video.filename,

        "filepath": video.filepath,

        "owner_id": video.owner_id,

        "athlete": (

            {
                "id": owner.id,

                "username": owner.username,

                "email": owner.email,

                "sport": owner.sport,

                "experience": owner.experience
            }

            if owner
            else None

        ),

        "analysis": {

            "frames_processed":
                video.frames_processed or 0,

            "pose_detected_frames":
                video.pose_detected_frames or 0,

            "average_knee_angle":
                average_knee,

            "left_knee_angle":
                video.left_knee_angle or 0,

            "right_knee_angle":
                video.right_knee_angle or 0,

            "left_hip_angle":
                video.left_hip_angle or 0,

            "right_hip_angle":
                video.right_hip_angle or 0,

            "left_shoulder_angle":
                video.left_shoulder_angle or 0,

            "right_shoulder_angle":
                video.right_shoulder_angle or 0,

            "left_elbow_angle":
                video.left_elbow_angle or 0,

            "right_elbow_angle":
                video.right_elbow_angle or 0,

            "posture_symmetry":
                video.posture_symmetry or 0,

            "movement_quality":
                video.movement_quality or "Unknown",

            "injury_risk":
                video.injury_risk or "Unknown",

            "recommendation":
                video.recommendation or ""

        }

    }


# ============================================================
# UPLOAD VIDEO
# ============================================================

@router.post("/upload")
def upload_video(

    file: UploadFile = File(...),

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Authenticate user
    # --------------------------------------------------------

    user = get_current_user(
        credentials,
        db
    )

    # --------------------------------------------------------
    # Only athletes can upload
    # --------------------------------------------------------

    if user.role != "Athlete":

        raise HTTPException(
            status_code=403,
            detail=(
                "Only athletes can upload "
                "training videos"
            )
        )

    # --------------------------------------------------------
    # Validate filename
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Invalid video filename"
        )

    # --------------------------------------------------------
    # Validate extension
    # --------------------------------------------------------

    allowed_extensions = {

        ".mp4",
        ".avi",
        ".mov",
        ".mkv",
        ".webm"

    }

    original_filename = os.path.basename(
        file.filename
    )

    extension = os.path.splitext(
        original_filename
    )[1].lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported video format. "
                "Allowed formats: "
                "MP4, AVI, MOV, MKV, WEBM"
            )
        )

    # --------------------------------------------------------
    # Create unique filename
    #
    # This prevents two athletes uploading files with
    # the same filename from overwriting each other.
    # --------------------------------------------------------

    unique_filename = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    filepath = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    # --------------------------------------------------------
    # Save uploaded video
    # --------------------------------------------------------

    try:

        with open(
            filepath,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unable to save uploaded video: "
                f"{str(error)}"
            )
        )

    # --------------------------------------------------------
    # AI VIDEO ANALYSIS
    # --------------------------------------------------------

    try:

        analysis = process_video(
            filepath
        )

        # Make sure analysis is a dictionary

        if analysis is None:

            analysis = {}

        if not isinstance(
            analysis,
            dict
        ):

            raise ValueError(
                "Video analysis returned "
                "an invalid result."
            )

    except Exception as error:

        # Remove failed upload

        if os.path.exists(filepath):

            try:

                os.remove(filepath)

            except Exception:

                pass

        raise HTTPException(
            status_code=500,
            detail=(
                "Video analysis failed: "
                f"{str(error)}"
            )
        )

    # --------------------------------------------------------
    # Save analysis to database
    # --------------------------------------------------------

    try:

        video = models.Video(

            filename=original_filename,

            filepath=filepath,

            owner_id=user.id,

            frames_processed=analysis.get(
                "frames_processed",
                0
            ),

            pose_detected_frames=analysis.get(
                "pose_detected_frames",
                0
            ),

            left_knee_angle=analysis.get(
                "left_knee_angle",
                0
            ),

            right_knee_angle=analysis.get(
                "right_knee_angle",
                0
            ),

            left_hip_angle=analysis.get(
                "left_hip_angle",
                0
            ),

            right_hip_angle=analysis.get(
                "right_hip_angle",
                0
            ),

            left_shoulder_angle=analysis.get(
                "left_shoulder_angle",
                0
            ),

            right_shoulder_angle=analysis.get(
                "right_shoulder_angle",
                0
            ),

            left_elbow_angle=analysis.get(
                "left_elbow_angle",
                0
            ),

            right_elbow_angle=analysis.get(
                "right_elbow_angle",
                0
            ),

            posture_symmetry=analysis.get(
                "posture_symmetry",
                0
            ),

            movement_quality=analysis.get(
                "movement_quality",
                "Unknown"
            ),

            injury_risk=analysis.get(
                "injury_risk",
                "Unknown"
            ),

            recommendation=analysis.get(
                "recommendation",
                ""
            )

        )

        db.add(video)

        db.commit()

        db.refresh(video)

    except Exception as error:

        db.rollback()

        # Remove uploaded file if database saving fails

        if os.path.exists(filepath):

            try:

                os.remove(filepath)

            except Exception:

                pass

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save video analysis "
                f"to database: {str(error)}"
            )
        )

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {

        "message":
            "Video uploaded and analyzed successfully",

        "video":
            format_video(video)

    }


# ============================================================
# ATHLETE - MY VIDEOS
# ============================================================

@router.get("/my-videos")
def my_videos(

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Authenticate
    # --------------------------------------------------------

    user = get_current_user(
        credentials,
        db
    )

    # --------------------------------------------------------
    # Only athletes
    # --------------------------------------------------------

    if user.role != "Athlete":

        raise HTTPException(
            status_code=403,
            detail=(
                "Only athletes can access "
                "their own videos"
            )
        )

    # --------------------------------------------------------
    # Get videos
    # --------------------------------------------------------

    videos = db.query(
        models.Video
    ).filter(
        models.Video.owner_id == user.id
    ).order_by(
        models.Video.id.desc()
    ).all()

    return [

        format_video(video)

        for video in videos

    ]


# ============================================================
# PROFESSIONAL - ASSIGNED ATHLETE VIDEOS
# ============================================================

@router.get("/assigned-athletes")
def assigned_athlete_videos(

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db)

):

    user = get_current_user(
        credentials,
        db
    )

    # --------------------------------------------------------
    # Only Coach / Physiotherapist
    # --------------------------------------------------------

    if user.role not in [

        "Coach",
        "Physiotherapist"

    ]:

        raise HTTPException(
            status_code=403,
            detail=(
                "Only Coaches and Physiotherapists "
                "can access assigned athlete videos"
            )
        )

    # --------------------------------------------------------
    # Find assigned athletes
    # --------------------------------------------------------

    if user.role == "Coach":

        athletes = db.query(
            models.User
        ).filter(
            models.User.role == "Athlete",
            models.User.coach_id == user.id
        ).order_by(
            models.User.username
        ).all()

    else:

        athletes = db.query(
            models.User
        ).filter(
            models.User.role == "Athlete",
            models.User.physio_id == user.id
        ).order_by(
            models.User.username
        ).all()

    # --------------------------------------------------------
    # Build response
    # --------------------------------------------------------

    results = []

    for athlete in athletes:

        videos = db.query(
            models.Video
        ).filter(
            models.Video.owner_id == athlete.id
        ).order_by(
            models.Video.id.desc()
        ).all()

        results.append({

            "athlete": {

                "id": athlete.id,

                "username": athlete.username,

                "email": athlete.email,

                "sport": athlete.sport,

                "experience": athlete.experience,

                "age": athlete.age,

                "gender": athlete.gender,

                "height": athlete.height,

                "weight": athlete.weight

            },

            "video_count":
                len(videos),

            "videos": [

                format_video(video)

                for video in videos

            ]

        })

    return {

        "professional_role":
            user.role,

        "athletes":
            results

    }


# ============================================================
# PROFESSIONAL - LATEST ATHLETE ANALYSES
# ============================================================

@router.get("/assigned-athletes/latest")
def latest_assigned_athlete_videos(

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db)

):

    user = get_current_user(
        credentials,
        db
    )

    # --------------------------------------------------------
    # Only Coach / Physiotherapist
    # --------------------------------------------------------

    if user.role not in [

        "Coach",
        "Physiotherapist"

    ]:

        raise HTTPException(
            status_code=403,
            detail=(
                "Only Coaches and Physiotherapists "
                "can access assigned athlete analyses"
            )
        )

    # --------------------------------------------------------
    # Find assigned athletes
    # --------------------------------------------------------

    if user.role == "Coach":

        athletes = db.query(
            models.User
        ).filter(
            models.User.role == "Athlete",
            models.User.coach_id == user.id
        ).order_by(
            models.User.username
        ).all()

    else:

        athletes = db.query(
            models.User
        ).filter(
            models.User.role == "Athlete",
            models.User.physio_id == user.id
        ).order_by(
            models.User.username
        ).all()

    # --------------------------------------------------------
    # Get latest video for every athlete
    # --------------------------------------------------------

    results = []

    for athlete in athletes:

        latest_video = db.query(
            models.Video
        ).filter(
            models.Video.owner_id == athlete.id
        ).order_by(
            models.Video.id.desc()
        ).first()

        results.append({

            "athlete": {

                "id": athlete.id,

                "username": athlete.username,

                "email": athlete.email,

                "sport": athlete.sport,

                "experience": athlete.experience

            },

            "latest_video": (

                format_video(latest_video)

                if latest_video

                else None

            )

        })

    return {

        "professional_role":
            user.role,

        "athletes":
            results

    }


# ============================================================
# PROFESSIONAL - SINGLE ATHLETE VIDEOS
# ============================================================

@router.get("/athlete/{athlete_id}")
def athlete_videos(

    athlete_id: int,

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db)

):

    user = get_current_user(
        credentials,
        db
    )

    # --------------------------------------------------------
    # Only professionals
    # --------------------------------------------------------

    if user.role not in [

        "Coach",
        "Physiotherapist"

    ]:

        raise HTTPException(
            status_code=403,
            detail=(
                "Only Coaches and Physiotherapists "
                "can access athlete videos"
            )
        )

    # --------------------------------------------------------
    # Find athlete
    # --------------------------------------------------------

    athlete = db.query(
        models.User
    ).filter(
        models.User.id == athlete_id,
        models.User.role == "Athlete"
    ).first()

    if athlete is None:

        raise HTTPException(
            status_code=404,
            detail="Athlete not found"
        )

    # --------------------------------------------------------
    # Verify assignment
    # --------------------------------------------------------

    if user.role == "Coach":

        if athlete.coach_id != user.id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "This athlete is not assigned "
                    "to you as a coach"
                )
            )

    else:

        if athlete.physio_id != user.id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "This athlete is not assigned "
                    "to you as a physiotherapist"
                )
            )

    # --------------------------------------------------------
    # Get athlete videos
    # --------------------------------------------------------

    videos = db.query(
        models.Video
    ).filter(
        models.Video.owner_id == athlete.id
    ).order_by(
        models.Video.id.desc()
    ).all()

    return {

        "athlete": {

            "id": athlete.id,

            "username": athlete.username,

            "email": athlete.email,

            "sport": athlete.sport,

            "experience": athlete.experience,

            "age": athlete.age,

            "gender": athlete.gender,

            "height": athlete.height,

            "weight": athlete.weight

        },

        "videos": [

            format_video(video)

            for video in videos

        ]

    }