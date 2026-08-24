from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_db
from ..auth import hash_password, verify_password
from ..jwt_handler import create_access_token, verify_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

security = HTTPBearer()


# ============================================================
# CURRENT USER HELPER
# ============================================================

def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials,
    db: Session
):

    payload = verify_token(credentials.credentials)

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

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=schemas.UserResponse
)
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Check duplicate email
    # --------------------------------------------------------

    existing_user = db.query(
        models.User
    ).filter(
        models.User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # --------------------------------------------------------
    # IMPORTANT:
    # Admin accounts should not be created through public
    # registration.
    # --------------------------------------------------------

    if user.role == "Admin":

        raise HTTPException(
            status_code=403,
            detail=(
                "Admin accounts cannot be created through "
                "public registration"
            )
        )

    # --------------------------------------------------------
    # Hash password
    # --------------------------------------------------------

    hashed_pwd = hash_password(user.password)

    # --------------------------------------------------------
    # Role-specific user creation
    # --------------------------------------------------------

    if user.role == "Athlete":

        new_user = models.User(

            username=user.username,

            email=user.email,

            hashed_password=hashed_pwd,

            role="Athlete",

            age=user.age,

            gender=user.gender,

            height=user.height,

            weight=user.weight,

            sport=user.sport,

            experience=user.experience,

            coach_id=None,

            physio_id=None
        )

    else:

        # Coach / Physiotherapist

        new_user = models.User(

            username=user.username,

            email=user.email,

            hashed_password=hashed_pwd,

            role=user.role,

            age=user.age,

            gender=user.gender,

            height=None,

            weight=None,

            sport=None,

            experience=None,

            coach_id=None,

            physio_id=None
        )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return new_user


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=schemas.Token
)
def login(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(
        models.User
    ).filter(
        models.User.email == user.email
    ).first()

    if db_user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        db_user.hashed_password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # --------------------------------------------------------
    # JWT
    # --------------------------------------------------------

    token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    return {

        "access_token": token,

        "token_type": "bearer",

        "role": db_user.role,

        "username": db_user.username
    }


# ============================================================
# CURRENT LOGGED-IN USER
# ============================================================

@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_authenticated_user(
        credentials,
        db
    )

    # --------------------------------------------------------
    # Common information
    # --------------------------------------------------------

    response = {

        "id": user.id,

        "username": user.username,

        "email": user.email,

        "role": user.role,

        "age": user.age,

        "gender": user.gender
    }

    # --------------------------------------------------------
    # ATHLETE
    # --------------------------------------------------------

    if user.role == "Athlete":

        response.update({

            "height": user.height,

            "weight": user.weight,

            "sport": user.sport,

            "experience": user.experience,

            "coach_id": user.coach_id,

            "physio_id": user.physio_id
        })

    # --------------------------------------------------------
    # COACH
    # --------------------------------------------------------

    elif user.role == "Coach":

        response["assigned_athletes_count"] = db.query(
            models.User
        ).filter(
            models.User.coach_id == user.id,
            models.User.role == "Athlete"
        ).count()

    # --------------------------------------------------------
    # PHYSIOTHERAPIST
    # --------------------------------------------------------

    elif user.role == "Physiotherapist":

        response["assigned_athletes_count"] = db.query(
            models.User
        ).filter(
            models.User.physio_id == user.id,
            models.User.role == "Athlete"
        ).count()

    # --------------------------------------------------------
    # ADMIN
    # --------------------------------------------------------

    elif user.role == "Admin":

        response["platform_statistics"] = {

            "total_users": db.query(
                models.User
            ).count(),

            "total_athletes": db.query(
                models.User
            ).filter(
                models.User.role == "Athlete"
            ).count(),

            "total_coaches": db.query(
                models.User
            ).filter(
                models.User.role == "Coach"
            ).count(),

            "total_physios": db.query(
                models.User
            ).filter(
                models.User.role == "Physiotherapist"
            ).count()
        }

    return response


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put("/profile")
def update_profile(
    profile: schemas.ProfileUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_authenticated_user(
        credentials,
        db
    )

    # --------------------------------------------------------
    # Common profile fields
    # --------------------------------------------------------

    user.age = profile.age

    user.gender = profile.gender

    # --------------------------------------------------------
    # ATHLETE
    # --------------------------------------------------------

    if user.role == "Athlete":

        user.height = profile.height

        user.weight = profile.weight

        user.sport = profile.sport

        user.experience = profile.experience

    # --------------------------------------------------------
    # NON-ATHLETES
    # --------------------------------------------------------

    else:

        # Coaches, Physiotherapists and Admins must never
        # contain athlete-specific fields.

        user.height = None

        user.weight = None

        user.sport = None

        user.experience = None

    db.commit()

    db.refresh(user)

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    response = {

        "username": user.username,

        "email": user.email,

        "role": user.role,

        "age": user.age,

        "gender": user.gender
    }

    if user.role == "Athlete":

        response.update({

            "height": user.height,

            "weight": user.weight,

            "sport": user.sport,

            "experience": user.experience,

            "coach_id": user.coach_id,

            "physio_id": user.physio_id
        })

    return {

        "message": "Profile updated successfully",

        "profile": response
    }