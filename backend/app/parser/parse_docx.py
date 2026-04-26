"""`.docx` 바이트 → Outline (Phase 1: 텍스트/헤딩만, 표/이미지는 placeholder)."""

import io
import uuid
from typing import Iterator

from docx import Document
from docx.document import Document as DocxDocument
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

from app.domain.outline import Block, Outline
from app.parser.detect_heading import detect_level


def _iter_top_level(doc: DocxDocument) -> Iterator[object]:
    """문서 본문 자식을 표시 순서대로 순회."""
    body = doc.element.body
    for child in body.iterchildren():
        if child.tag == qn("w:p"):
            yield Paragraph(child, doc)
        elif child.tag == qn("w:tbl"):
            yield Table(child, doc)


def _new_id() -> str:
    return f"b-{uuid.uuid4().hex[:8]}"


def parse_docx(content: bytes, *, filename: str) -> Outline:
    doc = Document(io.BytesIO(content))
    blocks: list[Block] = []
    table_idx = 0
    para_idx = 0
    for item in _iter_top_level(doc):
        if isinstance(item, Paragraph):
            level, detected_by = detect_level(item, paragraph_index=para_idx)
            para_idx += 1
            blocks.append(
                Block(
                    id=_new_id(),
                    kind="paragraph",
                    level=level,
                    text=item.text,
                    detected_by=detected_by,
                )
            )
        elif isinstance(item, Table):
            blocks.append(
                Block(
                    id=_new_id(),
                    kind="table",
                    level=0,
                    raw_ref=f"table-{table_idx}",
                )
            )
            table_idx += 1

    return Outline(job_id="", source_filename=filename, blocks=blocks)
