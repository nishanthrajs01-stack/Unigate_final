"""
PDF Generation Service — UCMS
Generates high-fidelity Offer Letters with watermarking and QR codes.
"""
import os
import io
import uuid
from datetime import datetime
from fpdf import FPDF
import qrcode
from PIL import Image


class OfferLetterPDF(FPDF):
    """Custom PDF class for Unigate Offer Letters."""

    NAVY = (15, 23, 42)       # #0F172A
    GOLD = (194, 157, 89)     # #C29D59
    WHITE = (255, 255, 255)
    GRAY = (100, 116, 139)
    LIGHT_BG = (248, 250, 252)

    def __init__(self, student_name: str, college_name: str, program: str,
                 letter_id: str, app_url: str):
        super().__init__()
        self.student_name = student_name
        self.college_name = college_name
        self.program = program
        self.letter_id = letter_id
        self.app_url = app_url

    def header(self):
        # Navy header bar
        self.set_fill_color(*self.NAVY)
        self.rect(0, 0, 210, 40, 'F')

        # Gold accent line
        self.set_fill_color(*self.GOLD)
        self.rect(0, 40, 210, 2, 'F')

        # Company name
        self.set_text_color(*self.WHITE)
        self.set_font('Helvetica', 'B', 22)
        self.set_xy(15, 10)
        self.cell(0, 10, 'UNIGATE CONSULTANCY', ln=False)

        # Subtitle
        self.set_font('Helvetica', '', 9)
        self.set_xy(15, 22)
        self.cell(0, 10, 'International Education & Admissions Partner', ln=False)

        self.ln(50)

    def footer(self):
        self.set_y(-30)

        # Gold line
        self.set_fill_color(*self.GOLD)
        self.rect(15, self.get_y(), 180, 0.5, 'F')

        self.ln(5)
        self.set_text_color(*self.GRAY)
        self.set_font('Helvetica', '', 7)
        self.cell(0, 5, 'This document is computer-generated and does not require a physical signature.', align='C', ln=True)
        self.cell(0, 5, f'Verify authenticity: {self.app_url}/verify/{self.letter_id}', align='C', ln=True)
        self.cell(0, 5, f'Document ID: {self.letter_id}  |  Page {self.page_no()}', align='C')

    def add_watermark(self):
        """Add diagonal watermark text."""
        self.set_text_color(230, 230, 240)
        self.set_font('Helvetica', 'B', 60)
        # Rotate text for watermark effect
        self.rotate(45, 105, 148)
        self.text(30, 200, 'UNIGATE')
        self.rotate(0)
        self.set_text_color(0, 0, 0)

    def generate_qr_code(self) -> str:
        """Generate QR code image and return path."""
        verification_url = f"{self.app_url}/verify/{self.letter_id}"
        qr = qrcode.QRCode(version=1, box_size=6, border=2)
        qr.add_data(verification_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color=(15, 23, 42), back_color="white")
        qr_path = os.path.join(os.path.dirname(__file__), '..', 'temp', f'qr_{self.letter_id}.png')
        os.makedirs(os.path.dirname(qr_path), exist_ok=True)
        img.save(qr_path)
        return qr_path


def generate_offer_letter(
    student_name: str,
    college_name: str,
    program: str,
    intake_year: int,
    total_fees: float,
    issue_date: str | None = None,
    app_url: str = "http://localhost:3000",
) -> tuple[bytes, str]:
    """
    Generate an Offer Letter PDF with watermark and QR code.

    Returns:
        tuple: (pdf_bytes, letter_id)
    """
    letter_id = str(uuid.uuid4())
    if not issue_date:
        issue_date = datetime.now().strftime("%B %d, %Y")

    pdf = OfferLetterPDF(student_name, college_name, program, letter_id, app_url)
    pdf.add_page()

    # Watermark
    pdf.add_watermark()

    # Date
    pdf.set_text_color(*OfferLetterPDF.GRAY)
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(0, 8, f'Date: {issue_date}', ln=True, align='R')
    pdf.ln(5)

    # Title
    pdf.set_text_color(*OfferLetterPDF.NAVY)
    pdf.set_font('Helvetica', 'B', 18)
    pdf.cell(0, 12, 'OFFICIAL OFFER OF ADMISSION', ln=True, align='C')

    # Gold separator
    pdf.set_fill_color(*OfferLetterPDF.GOLD)
    pdf.rect(70, pdf.get_y() + 2, 70, 1, 'F')
    pdf.ln(10)

    # Student info section
    pdf.set_fill_color(*OfferLetterPDF.LIGHT_BG)
    pdf.rect(15, pdf.get_y(), 180, 35, 'F')
    pdf.set_x(20)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(*OfferLetterPDF.GRAY)
    pdf.cell(40, 10, 'Student Name:', ln=False)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(*OfferLetterPDF.NAVY)
    pdf.cell(0, 10, student_name, ln=True)

    pdf.set_x(20)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(*OfferLetterPDF.GRAY)
    pdf.cell(40, 10, 'Institution:', ln=False)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(*OfferLetterPDF.NAVY)
    pdf.cell(0, 10, college_name, ln=True)

    pdf.set_x(20)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(*OfferLetterPDF.GRAY)
    pdf.cell(40, 10, 'Program:', ln=False)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(*OfferLetterPDF.NAVY)
    pdf.cell(0, 10, f'{program} — Intake {intake_year}', ln=True)
    pdf.ln(10)

    # Body text
    pdf.set_text_color(30, 41, 59)
    pdf.set_font('Helvetica', '', 11)

    body = f"""Dear {student_name},

We are pleased to inform you that your application for admission to {college_name} has been reviewed and accepted. This letter serves as your official Offer of Admission for the {program} program for the {intake_year} academic intake.

Please find the key details of your admission below:"""

    pdf.multi_cell(180, 7, body)
    pdf.ln(5)

    # Details table
    details = [
        ("Program of Study", program),
        ("Academic Year", str(intake_year)),
        ("Institution", college_name),
        ("Total Program Fees", f"INR {total_fees:,.2f}"),
        ("Document Reference", letter_id[:8].upper()),
    ]

    # Table header
    pdf.set_fill_color(*OfferLetterPDF.NAVY)
    pdf.set_text_color(*OfferLetterPDF.WHITE)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(90, 10, '  Detail', border=0, fill=True)
    pdf.cell(90, 10, '  Value', border=0, fill=True, ln=True)

    # Table rows
    for i, (key, value) in enumerate(details):
        if i % 2 == 0:
            pdf.set_fill_color(*OfferLetterPDF.LIGHT_BG)
        else:
            pdf.set_fill_color(*OfferLetterPDF.WHITE)
        pdf.set_text_color(*OfferLetterPDF.GRAY)
        pdf.set_font('Helvetica', '', 10)
        pdf.cell(90, 9, f'  {key}', border=0, fill=True)
        pdf.set_text_color(*OfferLetterPDF.NAVY)
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(90, 9, f'  {value}', border=0, fill=True, ln=True)

    pdf.ln(8)

    # Terms
    pdf.set_text_color(30, 41, 59)
    pdf.set_font('Helvetica', '', 10)
    terms = """Terms & Conditions:
1. This offer is valid for 30 days from the date of issue.
2. Admission is subject to verification of original academic documents.
3. Fees are payable as per the institution's payment schedule.
4. Unigate Consultancy acts as an authorized admission partner."""
    pdf.multi_cell(180, 6, terms)
    pdf.ln(5)

    # QR Code section
    qr_path = pdf.generate_qr_code()
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*OfferLetterPDF.NAVY)
    pdf.cell(140, 10, 'Scan to verify this document:', ln=False)
    pdf.image(qr_path, x=160, y=pdf.get_y() - 5, w=30)
    pdf.ln(25)

    # Signature area
    pdf.set_text_color(*OfferLetterPDF.NAVY)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(0, 8, 'Authorized by Unigate Consultancy', ln=True)
    pdf.set_draw_color(*OfferLetterPDF.GOLD)
    pdf.line(15, pdf.get_y(), 80, pdf.get_y())

    # Clean up QR temp file
    try:
        os.remove(qr_path)
    except OSError:
        pass

    pdf_bytes = pdf.output()
    return bytes(pdf_bytes), letter_id
