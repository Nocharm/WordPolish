"""디스크에 저장된 OOXML 조각을 새 .docx body 에 재삽입."""

import uuid

from docx.document import Document as DocxDocument
from lxml import etree

from app.domain.style_spec import StyleSpec
from app.renderer.apply_table_style import apply_table_style
from app.storage.files import raw_ooxml_path


def _parse_fragment(xml_bytes: bytes):
    parser = etree.XMLParser(remove_blank_text=False)
    wrapped = (
        b'<root xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        + xml_bytes
        + b"</root>"
    )
    root = etree.fromstring(wrapped, parser=parser)
    return root[0]


def reembed_table(
    doc: DocxDocument,
    *,
    raw_ref: str,
    user_id: uuid.UUID,
    job_id: uuid.UUID,
    spec: StyleSpec,
) -> None:
    """`raw_ref` 로 디스크에서 <w:tbl> 조각을 읽어 본문 끝에 추가하고 스타일을 덮어쓴다."""
    p = raw_ooxml_path(user_id, job_id, raw_ref)
    if not p.exists():
        doc.add_paragraph(f"[표 원본 누락 — {raw_ref}]")
        return
    tbl_el = _parse_fragment(p.read_bytes())
    apply_table_style(tbl_el, spec)
    doc.element.body.append(tbl_el)
    doc.add_paragraph()  # python-docx 가 표 직후 빈 문단을 요구하는 경우 안전 패딩
