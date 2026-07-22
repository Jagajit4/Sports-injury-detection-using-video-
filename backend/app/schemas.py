from pydantic import BaseModel, EmailStr


# -----------------------------
# User Registration
# -----------------------------
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    age: int | None = None
    gender: str | None = None
    height: float | None = None
    weight: float | None = None
    sport: str | None = None
    experience: int | None = None


# -----------------------------
# User Response
# -----------------------------
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    age: int | None = None
    gender: str | None = None
    height: float | None = None
    weight: float | None = None
    sport: str | None = None
    experience: int | None = None

    class Config:
        from_attributes = True


# -----------------------------
# Login Request
# -----------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -----------------------------
# JWT Token
# -----------------------------
class Token(BaseModel):
    access_token: str
    token_type: str


# -----------------------------
# Profile Update
# -----------------------------
class ProfileUpdate(BaseModel):
    age: int | None = None
    gender: str | None = None
    height: float | None = None
    weight: float | None = None
    sport: str | None = None
    experience: int | None = None