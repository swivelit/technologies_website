from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models
from .routers import auth, projects


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Swivel Career Platform API",
    version="1.0.0"
)


# Allow frontend applications to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local frontend
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",

        # Local frontend using 127.0.0.1
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",

        # Local IPv6
        "http://[::1]:5173",
        "http://[::1]:5174",
        "http://[::1]:5175",

        # Deployed frontend
        "https://technologies-website-6gb7.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(auth.router)
app.include_router(projects.router)


@app.get("/")
def root():
    return {
        "message": "Swivel Career Platform API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }