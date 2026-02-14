"""
UCMS — Unigate Consultancy Management System
FastAPI Backend / Automation Engine
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="UCMS API",
    description="Unigate Consultancy Management System — Automation Engine",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — Allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("APP_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from routers import pdf, email

app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF Generation"])
app.include_router(email.router, prefix="/api/email", tags=["Email Service"])


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "service": "UCMS Automation Engine", "version": "2.0.0"}


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "UCMS Automation Engine is running",
        "docs": "/docs",
        "health": "/health",
    }
