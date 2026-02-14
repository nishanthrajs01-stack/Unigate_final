"""
PDF Generation Router — UCMS
Endpoints for generating Offer Letters and other documents.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from services.pdf_service import generate_offer_letter
import os

router = APIRouter()


class OfferLetterRequest(BaseModel):
    student_name: str
    college_name: str
    program: str
    intake_year: int = 2025
    total_fees: float = 0.0
    issue_date: str | None = None


class OfferLetterResponse(BaseModel):
    letter_id: str
    message: str


@router.post("/offer-letter", response_model=OfferLetterResponse)
async def create_offer_letter(request: OfferLetterRequest):
    """Generate an Offer Letter PDF with QR code and watermark."""
    try:
        app_url = os.getenv("APP_URL", "http://localhost:3000")
        pdf_bytes, letter_id = generate_offer_letter(
            student_name=request.student_name,
            college_name=request.college_name,
            program=request.program,
            intake_year=request.intake_year,
            total_fees=request.total_fees,
            issue_date=request.issue_date,
            app_url=app_url,
        )
        return OfferLetterResponse(
            letter_id=letter_id,
            message="Offer letter generated successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/offer-letter/download")
async def download_offer_letter(request: OfferLetterRequest):
    """Generate and directly download an Offer Letter PDF."""
    try:
        app_url = os.getenv("APP_URL", "http://localhost:3000")
        pdf_bytes, letter_id = generate_offer_letter(
            student_name=request.student_name,
            college_name=request.college_name,
            program=request.program,
            intake_year=request.intake_year,
            total_fees=request.total_fees,
            issue_date=request.issue_date,
            app_url=app_url,
        )

        filename = f"{request.student_name.replace(' ', '_')}_Offer_Letter.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "X-Letter-ID": letter_id,
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
