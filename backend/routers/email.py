"""
Email Router — UCMS
Endpoints for sending transactional emails.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from services.email_service import (
    send_email,
    get_welcome_email,
    get_status_change_email,
    get_admission_email,
)

router = APIRouter()


class WelcomeEmailRequest(BaseModel):
    to_email: EmailStr
    student_name: str


class StatusChangeEmailRequest(BaseModel):
    to_email: EmailStr
    student_name: str
    new_status: str
    notes: str = ""


class AdmissionEmailRequest(BaseModel):
    to_email: EmailStr
    student_name: str
    college_name: str
    program: str


class EmailResponse(BaseModel):
    success: bool
    message: str = ""
    error: str = ""


@router.post("/welcome", response_model=EmailResponse)
async def send_welcome_email(request: WelcomeEmailRequest):
    """Send a welcome email to a new student."""
    subject, html = get_welcome_email(request.student_name)
    result = await send_email(request.to_email, subject, html)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Email sending failed"))
    return EmailResponse(success=True, message=result["message"])


@router.post("/status-change", response_model=EmailResponse)
async def send_status_change_email(request: StatusChangeEmailRequest):
    """Send a status change notification email."""
    subject, html = get_status_change_email(
        request.student_name, request.new_status, request.notes
    )
    result = await send_email(request.to_email, subject, html)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Email sending failed"))
    return EmailResponse(success=True, message=result["message"])


@router.post("/admission", response_model=EmailResponse)
async def send_admission_email(request: AdmissionEmailRequest):
    """Send an admission confirmation email."""
    subject, html = get_admission_email(
        request.student_name, request.college_name, request.program
    )
    result = await send_email(request.to_email, subject, html)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Email sending failed"))
    return EmailResponse(success=True, message=result["message"])
