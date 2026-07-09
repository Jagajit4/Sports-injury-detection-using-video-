from pydantic import BaseModel, EmailStr

# User Registration Request
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


# User Response
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True