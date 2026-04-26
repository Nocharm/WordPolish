"""parse_docx: .docx → Outline."""

from pathlib import Path

from app.parser.parse_docx import parse_docx

FIXTURES = Path(__file__).resolve().parent / "fixtures"


def test_parse_simple_headings_and_body():
    outline = parse_docx((FIXTURES / "sample_simple.docx").read_bytes(), filename="sample_simple.docx")
    kinds = [b.kind for b in outline.blocks]
    levels = [b.level for b in outline.blocks if b.kind == "paragraph"]
    assert kinds.count("paragraph") == 4
    # H1, body, H2, body
    assert levels == [1, 0, 2, 0]
    assert outline.blocks[0].detected_by == "word_style"


def test_parse_heuristic_headings():
    outline = parse_docx((FIXTURES / "sample_heuristic.docx").read_bytes(), filename="sample_heuristic.docx")
    paras = [b for b in outline.blocks if b.kind == "paragraph"]
    assert paras[0].level == 1 and paras[0].detected_by == "heuristic"
    assert paras[2].level == 2 and paras[2].detected_by == "heuristic"


def test_parse_table_emits_placeholder_block():
    outline = parse_docx((FIXTURES / "sample_with_table.docx").read_bytes(), filename="sample_with_table.docx")
    table_blocks = [b for b in outline.blocks if b.kind == "table"]
    assert len(table_blocks) == 1
    assert table_blocks[0].markdown is None  # Phase 1: 마크다운 미생성
    assert table_blocks[0].raw_ref is not None


def test_parse_block_ids_are_unique():
    outline = parse_docx((FIXTURES / "sample_simple.docx").read_bytes(), filename="x.docx")
    ids = [b.id for b in outline.blocks]
    assert len(ids) == len(set(ids))


def test_parse_collapses_consecutive_empty_paragraphs():
    outline = parse_docx((FIXTURES / "sample_messy.docx").read_bytes(), filename="m.docx")
    paras = [b for b in outline.blocks if b.kind == "paragraph"]
    # consecutive empty 검사
    for i in range(len(paras) - 1):
        a_empty = not (paras[i].text or "").strip()
        b_empty = not (paras[i + 1].text or "").strip()
        assert not (a_empty and b_empty), f"consecutive empty at {i}"


def test_parse_extracts_alignment_for_centered_cover():
    outline = parse_docx((FIXTURES / "sample_messy.docx").read_bytes(), filename="m.docx")
    # 첫 paragraph는 가운데정렬 표지여야 함
    paras = [b for b in outline.blocks if b.kind == "paragraph"]
    assert paras[0].alignment == "center"
