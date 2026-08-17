from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator


# ============================================================
# ROLE DEFINITIONS
# ============================================================

UserRole = Literal[
    "Athlete",
    "Coach",
    "Physiotherapist",
    "Admin"
]


# ============================================================
# REGISTER USER
# ============================================================

class UserCreate(BaseModel):

    username: str = Field(
        min_length=2,
        max_length=50
    )

    email: EmailStr

    password: str = Field(
        min_length=6,
        max_length=128
    )

    role: UserRole = "Athlete"

    # Athlete profile
    age: int | None = Field(
        default=None,
        ge=10,
        le=100
    )

    gender: str | None = None

    height: float | None = Field(
        default=None,
        gt=0,
        le=250
    )

    weight: float | None = Field(
        default=None,
        gt=0,
        le=300
    )

    sport: str | None = None

    experience: int | None = Field(
        default=None,
        ge=0,
        le=80
    )

    @model_validator(mode="after")
    def validate_role_data(self):

        # Non-athletes must not have athlete-specific
        # physical/sport information.
        if self.role != "Athlete":

            self.height = None
            self.weight = None
            self.sport = None
            self.experience = None

        return self


# ============================================================
# USER RESPONSE
# ============================================================

class UserResponse(BaseModel):

    id: int

    username: str

    email: EmailStr

    role: UserRole

    age: int | None = None

    gender: str | None = None

    height: float | None = None

    weight: float | None = None

    sport: str | None = None

    experience: int | None = None

    coach_id: int | None = None

    physio_id: int | None = None

    class Config:
        from_attributes = True


# ============================================================
# LOGIN
# ============================================================

class UserLogin(BaseModel):

    email: EmailStr

    password: str


# ============================================================
# TOKEN
# ============================================================

class Token(BaseModel):

    access_token: str

    token_type: str

    role: UserRole

    username: str


# ============================================================
# PROFILE UPDATE
# ============================================================

class ProfileUpdate(BaseModel):

    age: int | None = Field(
        default=None,
        ge=10,
        le=100
    )

    gender: str | None = None

    height: float | None = Field(
        default=None,
        gt=0,
        le=250
    )

    weight: float | None = Field(
        default=None,
        gt=0,
        le=300
    )

    sport: str | None = None

    experience: int | None = Field(
        default=None,
        ge=0,
        le=80
    )


# ============================================================
# CONNECTION RESPONSE
# ============================================================

class ConnectionResponse(BaseModel):

    id: int

    athlete_id: int

    professional_id: int

    professional_role: Literal[
        "Coach",
        "Physiotherapist"
    ]

    status: str


# ============================================================
# ADMIN USER RESPONSE
# ============================================================

class AdminUserResponse(BaseModel):

    id: int

    username: str

    email: EmailStr

    role: UserRole

    age: int | None = None

    gender: str | None = None

    height: float | None = None

    weight: float | None = None

    sport: str | None = None

    experience: int | None = None

    coach_id: int | None = None

    physio_id: int | None = None