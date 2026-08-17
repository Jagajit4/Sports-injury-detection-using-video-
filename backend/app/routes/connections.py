from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .. import models
from ..dependencies import get_db
from ..jwt_handler import verify_token


router = APIRouter(
    prefix="/connections",
    tags=["Connections"]
)

security = HTTPBearer()


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    payload = verify_token(
        credentials.credentials
    )

    if payload is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    email = payload.get("sub")

    if not email:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
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
# AVAILABLE COACHES
# ATHLETE ONLY
# ============================================================

@router.get("/coaches")
def get_coaches(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "Athlete":

        raise HTTPException(
            status_code=403,
            detail="Only athletes can view coaches"
        )

    coaches = db.query(
        models.User
    ).filter(
        models.User.role == "Coach"
    ).order_by(
        models.User.username
    ).all()

    return [

        {
            "id": coach.id,
            "username": coach.username,
            "email": coach.email,
            "assigned_athletes": db.query(
                models.User
            ).filter(
                models.User.coach_id == coach.id,
                models.User.role == "Athlete"
            ).count()
        }

        for coach in coaches
    ]


# ============================================================
# AVAILABLE PHYSIOTHERAPISTS
# ATHLETE ONLY
# ============================================================

@router.get("/physios")
def get_physios(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "Athlete":

        raise HTTPException(
            status_code=403,
            detail="Only athletes can view physiotherapists"
        )

    physios = db.query(
        models.User
    ).filter(
        models.User.role == "Physiotherapist"
    ).order_by(
        models.User.username
    ).all()

    return [

        {
            "id": physio.id,
            "username": physio.username,
            "email": physio.email,
            "assigned_athletes": db.query(
                models.User
            ).filter(
                models.User.physio_id == physio.id,
                models.User.role == "Athlete"
            ).count()
        }

        for physio in physios
    ]


# ============================================================
# SEND CONNECTION REQUEST
# ATHLETE ONLY
# ============================================================

@router.post("/request/{professional_id}")
def send_connection_request(
    professional_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "Athlete":

        raise HTTPException(
            status_code=403,
            detail="Only athletes can send connection requests"
        )

    if current_user.id == professional_id:

        raise HTTPException(
            status_code=400,
            detail="You cannot connect with yourself"
        )

    professional = db.query(
        models.User
    ).filter(
        models.User.id == professional_id
    ).first()

    if professional is None:

        raise HTTPException(
            status_code=404,
            detail="Professional not found"
        )

    if professional.role not in [
        "Coach",
        "Physiotherapist"
    ]:

        raise HTTPException(
            status_code=400,
            detail=(
                "Athletes can only connect with "
                "Coaches or Physiotherapists"
            )
        )

    # --------------------------------------------------------
    # Already connected
    # --------------------------------------------------------

    if professional.role == "Coach":

        if current_user.coach_id == professional.id:

            raise HTTPException(
                status_code=400,
                detail="Already connected with this coach"
            )

    if professional.role == "Physiotherapist":

        if current_user.physio_id == professional.id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Already connected with this "
                    "physiotherapist"
                )
            )

    # --------------------------------------------------------
    # Athlete already has a professional of this type
    # --------------------------------------------------------

    if professional.role == "Coach":

        if current_user.coach_id is not None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "You already have a coach. "
                    "Disconnect your current coach "
                    "before requesting another one."
                )
            )

    if professional.role == "Physiotherapist":

        if current_user.physio_id is not None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "You already have a physiotherapist. "
                    "Disconnect your current physiotherapist "
                    "before requesting another one."
                )
            )

    # --------------------------------------------------------
    # Existing pending request
    # --------------------------------------------------------

    existing_request = db.query(
        models.ConnectionRequest
    ).filter(
        models.ConnectionRequest.athlete_id == current_user.id,
        models.ConnectionRequest.professional_id == professional.id,
        models.ConnectionRequest.status == "pending"
    ).first()

    if existing_request:

        raise HTTPException(
            status_code=400,
            detail="A request is already pending"
        )

    # --------------------------------------------------------
    # Create request
    # --------------------------------------------------------

    request = models.ConnectionRequest(

        athlete_id=current_user.id,

        professional_id=professional.id,

        professional_role=professional.role,

        status="pending"
    )

    db.add(request)

    db.commit()

    db.refresh(request)

    return {

        "message": "Connection request sent successfully",

        "request_id": request.id,

        "professional": professional.username,

        "professional_role": professional.role,

        "status": request.status
    }


# ============================================================
# ATHLETE — MY REQUESTS
# ============================================================

@router.get("/my-requests")
def get_my_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "Athlete":

        raise HTTPException(
            status_code=403,
            detail="Only athletes can view their requests"
        )

    requests = db.query(
        models.ConnectionRequest
    ).filter(
        models.ConnectionRequest.athlete_id == current_user.id
    ).order_by(
        models.ConnectionRequest.id.desc()
    ).all()

    return [

        {
            "id": request.id,

            "professional_id": request.professional_id,

            "professional_name": (
                request.professional.username
                if request.professional
                else "Unknown"
            ),

            "professional_role": request.professional_role,

            "status": request.status,

            "created_at": request.created_at
        }

        for request in requests
    ]


# ============================================================
# PROFESSIONAL — PENDING REQUESTS
# ============================================================

@router.get("/pending")
def get_pending_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role not in [
        "Coach",
        "Physiotherapist"
    ]:

        raise HTTPException(
            status_code=403,
            detail=(
                "Only Coaches and Physiotherapists "
                "can view pending requests"
            )
        )

    requests = db.query(
        models.ConnectionRequest
    ).filter(
        models.ConnectionRequest.professional_id == current_user.id,
        models.ConnectionRequest.professional_role == current_user.role,
        models.ConnectionRequest.status == "pending"
    ).order_by(
        models.ConnectionRequest.id.desc()
    ).all()

    return [

        {
            "id": request.id,

            "athlete_id": request.athlete_id,

            "athlete_name": request.athlete.username,

            "athlete_email": request.athlete.email,

            "sport": request.athlete.sport,

            "experience": request.athlete.experience,

            "status": request.status,

            "created_at": request.created_at
        }

        for request in requests
    ]


# ============================================================
# ACCEPT REQUEST
# ============================================================

@router.put("/accept/{request_id}")
def accept_request(
    request_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role not in [
        "Coach",
        "Physiotherapist"
    ]:

        raise HTTPException(
            status_code=403,
            detail=(
                "Only Coaches and Physiotherapists "
                "can accept requests"
            )
        )

    request = db.query(
        models.ConnectionRequest
    ).filter(
        models.ConnectionRequest.id == request_id
    ).first()

    if request is None:

        raise HTTPException(
            status_code=404,
            detail="Connection request not found"
        )

    if request.professional_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You cannot manage this request"
        )

    if request.professional_role != current_user.role:

        raise HTTPException(
            status_code=403,
            detail="Invalid professional role"
        )

    if request.status != "pending":

        raise HTTPException(
            status_code=400,
            detail="This request is no longer pending"
        )

    athlete = db.query(
        models.User
    ).filter(
        models.User.id == request.athlete_id
    ).first()

    if athlete is None:

        raise HTTPException(
            status_code=404,
            detail="Athlete not found"
        )

    if athlete.role != "Athlete":

        raise HTTPException(
            status_code=400,
            detail="Only athletes can be connected"
        )

    # --------------------------------------------------------
    # COACH CONNECTION
    # --------------------------------------------------------

    if current_user.role == "Coach":

        if athlete.coach_id is not None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "This athlete already has a coach"
                )
            )

        athlete.coach_id = current_user.id

    # --------------------------------------------------------
    # PHYSIOTHERAPIST CONNECTION
    # --------------------------------------------------------

    elif current_user.role == "Physiotherapist":

        if athlete.physio_id is not None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "This athlete already has a "
                    "physiotherapist"
                )
            )

        athlete.physio_id = current_user.id

    # --------------------------------------------------------
    # Accept current request
    # --------------------------------------------------------

    request.status = "accepted"

    # --------------------------------------------------------
    # Close other pending requests of same professional type
    #
    # Example:
    # Athlete requests Coach A and Coach B.
    # Coach A accepts.
    # Coach B's pending request is no longer useful.
    # --------------------------------------------------------

    other_requests = db.query(
        models.ConnectionRequest
    ).filter(
        models.ConnectionRequest.athlete_id == athlete.id,
        models.ConnectionRequest.professional_role == current_user.role,
        models.ConnectionRequest.status == "pending",
        models.ConnectionRequest.id != request.id
    ).all()

    for other_request in other_requests:

        other_request.status = "rejected"

    db.commit()

    return {

        "message": "Connection request accepted",

        "athlete_id": athlete.id,

        "athlete_name": athlete.username,

        "professional_id": current_user.id,

        "professional_role": current_user.role
    }


# ============================================================
# REJECT REQUEST
# ============================================================

@router.put("/reject/{request_id}")
def reject_request(
    request_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role not in [
        "Coach",
        "Physiotherapist"
    ]:

        raise HTTPException(
            status_code=403,
            detail="Only professionals can reject requests"
        )

    request = db.query(
        models.ConnectionRequest
    ).filter(
        models.ConnectionRequest.id == request_id
    ).first()

    if request is None:

        raise HTTPException(
            status_code=404,
            detail="Connection request not found"
        )

    if request.professional_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You cannot manage this request"
        )

    if request.professional_role != current_user.role:

        raise HTTPException(
            status_code=403,
            detail="Invalid professional role"
        )

    if request.status != "pending":

        raise HTTPException(
            status_code=400,
            detail="This request is no longer pending"
        )

    request.status = "rejected"

    db.commit()

    return {

        "message": "Connection request rejected",

        "request_id": request.id
    }


# ============================================================
# CANCEL REQUEST
# ============================================================

@router.delete("/cancel/{request_id}")
def cancel_request(
    request_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "Athlete":

        raise HTTPException(
            status_code=403,
            detail="Only athletes can cancel requests"
        )

    request = db.query(
        models.ConnectionRequest
    ).filter(
        models.ConnectionRequest.id == request_id
    ).first()

    if request is None:

        raise HTTPException(
            status_code=404,
            detail="Connection request not found"
        )

    if request.athlete_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You cannot cancel this request"
        )

    if request.status != "pending":

        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be cancelled"
        )

    request.status = "cancelled"

    db.commit()

    return {

        "message": "Connection request cancelled",

        "request_id": request.id
    }


# ============================================================
# MY CONNECTIONS
# ============================================================

@router.get("/my-connections")
def get_my_connections(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # ========================================================
    # ATHLETE
    # ========================================================

    if current_user.role == "Athlete":

        coach = None

        physio = None

        if current_user.coach_id:

            coach = db.query(
                models.User
            ).filter(
                models.User.id == current_user.coach_id,
                models.User.role == "Coach"
            ).first()

        if current_user.physio_id:

            physio = db.query(
                models.User
            ).filter(
                models.User.id == current_user.physio_id,
                models.User.role == "Physiotherapist"
            ).first()

        return {

            "role": "Athlete",

            "coach": (
                {
                    "id": coach.id,
                    "username": coach.username,
                    "email": coach.email
                }
                if coach
                else None
            ),

            "physiotherapist": (
                {
                    "id": physio.id,
                    "username": physio.username,
                    "email": physio.email
                }
                if physio
                else None
            )
        }

    # ========================================================
    # COACH
    # ========================================================

    if current_user.role == "Coach":

        athletes = db.query(
            models.User
        ).filter(
            models.User.coach_id == current_user.id,
            models.User.role == "Athlete"
        ).order_by(
            models.User.username
        ).all()

        return {

            "role": "Coach",

            "athletes": [

                {
                    "id": athlete.id,
                    "username": athlete.username,
                    "email": athlete.email,
                    "age": athlete.age,
                    "gender": athlete.gender,
                    "height": athlete.height,
                    "weight": athlete.weight,
                    "sport": athlete.sport,
                    "experience": athlete.experience,
                    "physio_id": athlete.physio_id
                }

                for athlete in athletes
            ]
        }

    # ========================================================
    # PHYSIOTHERAPIST
    # ========================================================

    if current_user.role == "Physiotherapist":

        athletes = db.query(
            models.User
        ).filter(
            models.User.physio_id == current_user.id,
            models.User.role == "Athlete"
        ).order_by(
            models.User.username
        ).all()

        return {

            "role": "Physiotherapist",

            "athletes": [

                {
                    "id": athlete.id,
                    "username": athlete.username,
                    "email": athlete.email,
                    "age": athlete.age,
                    "gender": athlete.gender,
                    "height": athlete.height,
                    "weight": athlete.weight,
                    "sport": athlete.sport,
                    "experience": athlete.experience,
                    "coach_id": athlete.coach_id
                }

                for athlete in athletes
            ]
        }

    # ========================================================
    # ADMIN
    # ========================================================

    if current_user.role == "Admin":

        return {

            "role": "Admin",

            "message": (
                "Administrators manage the platform "
                "through the Admin Dashboard."
            )
        }

    raise HTTPException(
        status_code=403,
        detail="Unsupported role"
    )


# ============================================================
# DISCONNECT ATHLETE
# ============================================================

@router.delete("/disconnect/{athlete_id}")
def disconnect_athlete(
    athlete_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role not in [
        "Coach",
        "Physiotherapist"
    ]:

        raise HTTPException(
            status_code=403,
            detail=(
                "Only Coaches and Physiotherapists "
                "can disconnect athletes"
            )
        )

    athlete = db.query(
        models.User
    ).filter(
        models.User.id == athlete_id
    ).first()

    if athlete is None:

        raise HTTPException(
            status_code=404,
            detail="Athlete not found"
        )

    if athlete.role != "Athlete":

        raise HTTPException(
            status_code=400,
            detail="Selected user is not an athlete"
        )

    # --------------------------------------------------------
    # Coach
    # --------------------------------------------------------

    if current_user.role == "Coach":

        if athlete.coach_id != current_user.id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "This athlete is not connected "
                    "with you as a coach"
                )
            )

        athlete.coach_id = None

    # --------------------------------------------------------
    # Physiotherapist
    # --------------------------------------------------------

    elif current_user.role == "Physiotherapist":

        if athlete.physio_id != current_user.id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "This athlete is not connected "
                    "with you as a physiotherapist"
                )
            )

        athlete.physio_id = None

    db.commit()

    return {

        "message": "Athlete disconnected successfully",

        "athlete_id": athlete.id
    }