from datetime import datetime
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.services.seller_service import normalize_seller


PDF_I18N = {
    "sq": {
        "doc_title": "PREVENTIV",
        "date": "Data",
        "for_client": "PËR KLIENTIN",
        "unit_price": "ÇMIMI UNITAR",
        "qty": "SASIA",
        "product": "PRODUKTI",
        "total": "TOTALI",
        "total_eur": "TOTAL EUR",
        "phone": "Tel",
        "generated_at": "Gjeneruar më",
        "page": "Faqja",
    },
    "en": {
        "doc_title": "ESTIMATE",
        "date": "Date",
        "for_client": "BILLED TO",
        "unit_price": "UNIT PRICE",
        "qty": "QTY",
        "product": "PRODUCT",
        "total": "TOTAL",
        "total_eur": "TOTAL EUR",
        "phone": "Phone",
        "generated_at": "Generated",
        "page": "Page",
    },
}


def generate_pdf(preventiv) -> bytes:
    buffer = BytesIO()
    doc = BaseDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    elements = []
    styles = getSampleStyleSheet()

    seller = normalize_seller(getattr(preventiv, "seller_snapshot", None))
    items = preventiv.items
    grand_total = sum(item.total for item in items)

    stamp = datetime.now().strftime("%d/%m/%Y %H:%M")

    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")

    def make_footer(lang: str):
        tr = PDF_I18N[lang]

        def _footer(canvas, doc_):
            canvas.saveState()
            canvas.setFont("Helvetica", 8)
            canvas.setStrokeColor(colors.lightgrey)
            canvas.line(40, 50, A4[0] - 40, 50)
            canvas.drawString(40, 35, f"{tr['generated_at']}: {stamp}")
            canvas.drawRightString(A4[0] - 40, 35, f"{tr['page']} {doc_.page}")
            canvas.restoreState()

        return _footer

    doc.addPageTemplates(
        [
            PageTemplate(id="SQ", frames=[frame], onPage=make_footer("sq")),
            PageTemplate(id="EN", frames=[frame], onPage=make_footer("en")),
        ]
    )

    def build_language(lang: str):
        tr = PDF_I18N[lang]

        header_data = [
            [
                Paragraph(
                    f"<b>{seller.get('name', '')}</b><br/>"
                    f"<font size=9>{seller.get('address','')}<br/>{tr['phone']}: {seller.get('phone','')}</font>",
                    styles["Normal"],
                ),
                Paragraph(
                    f"<align='right'><font size=16 color='#2563eb'><b>{tr['doc_title']} #{preventiv.id}</b></font><br/>"
                    f"<font size=10>{tr['date']}: {preventiv.created_at.strftime('%d/%m/%Y')}</font></align>",
                    styles["Normal"],
                ),
            ]
        ]
        elements.append(Table(header_data, colWidths=[300, 220]))
        elements.append(Spacer(1, 20))

        elements.append(
            Paragraph(
                f"<b>{tr['for_client']}:</b>",
                ParagraphStyle("Small", fontSize=9, textColor=colors.grey),
            )
        )
        elements.append(Paragraph(f"{preventiv.client_name}", styles["Heading3"]))
        elements.append(Spacer(1, 20))

        data = [[tr["product"], tr["qty"], tr["unit_price"], tr["total"]]]
        for item in items:
            data.append(
                [
                    item.name_snapshot,
                    str(item.quantity),
                    f"{item.price_snapshot:.2f} €",
                    f"{item.total:.2f} €",
                ]
            )

        data.append(["", "", tr["total_eur"], f"{grand_total:.2f} €"])

        table = Table(data, colWidths=[270, 70, 90, 90])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#64748b")),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("ALIGN", (1, 1), (-1, -1), "CENTER"),
                    ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
                    ("ALIGN", (3, 0), (-1, -1), "RIGHT"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor("#e2e8f0")),
                    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, -1), (-1, -1), 12),
                    ("TEXTCOLOR", (0, -1), (-1, -1), colors.HexColor("#2563eb")),
                ]
            )
        )
        elements.append(table)

    # Always generate bilingual (SQ + EN) in the same PDF
    build_language("sq")
    elements.append(NextPageTemplate("EN"))
    elements.append(PageBreak())
    build_language("en")

    doc.build(elements)
    return buffer.getvalue()

