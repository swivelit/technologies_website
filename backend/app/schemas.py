from datetime import datetime

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "candidate"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class ProjectCreate(BaseModel):
    title: str
    description: str
    category: str | None = None
    difficulty: str | None = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str | None
    difficulty: str | None
    creator_id: int | None
    created_at: datetime | None

    class Config:
        from_attributes = True