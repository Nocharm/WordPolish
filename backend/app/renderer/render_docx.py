"""Outline + StyleSpec → .docx 바이트."""

import io

from docx import Document
from docx.shared import Mm

from app.domain.outline import Block, Outline
from app.domain.style_spec import StyleSpec
from app.renderer.apply_style import apply_paragraph_style
from app.renderer.inject_numbering import renumber

_PLACEHOLDER = {
    "table": "[표는 다음 Phase에서 지원 예정]",
    "image": "[이미지는 다음 Phase에서 지원 예정]",
    "field": "[참조는 다음 Phase에서 지원 예정]",
}


def _setup_page(doc, spec: StyleSpec) -> None:
    section = doc.sections[0]
    section.top_margin = Mm(spec.page.margin_top_mm)
    section.bottom_margin = Mm(spec.page.margin_bottom_mm)
    section.left_margin = Mm(spec.page.margin_left_mm)
    section.right_margin = Mm(spec.page.margin_right_mm)


def _add_paragraph(doc, block: Block, spec: StyleSpec) -> None:
    if block.kind == "paragraph":
        para = doc.add_paragraph(block.text or "")
        apply_paragraph_style(para, block.level, spec, alignment_override=block.alignment)
    else:
        text = _PLACEHOLDER.get(block.kind, "[unknown block]")
        if block.caption:
            text = f"{text} ({block.caption})"
        para = doc.add_paragraph(text)
        apply_paragraph_style(para, 0, spec)


def render_docx(outline: Outline, spec: StyleSpec) -> bytes:
    doc = Document()
    _setup_page(doc, spec)
    blocks = renumber(outline.blocks, spec)
    for b in blocks:
        _add_paragraph(doc, b, spec)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()
