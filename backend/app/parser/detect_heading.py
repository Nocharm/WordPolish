"""제목 레벨 감지 — (a) Word 스타일 → (b) 휴리스틱 → (c=0, body 폴백).

(c) 사용자 마킹은 프론트에서 처리되므로 파서 단계에선 noop.
"""

import re
from typing import Any, Literal

DetectedBy = Literal["word_style", "heuristic"]

_WORD_HEADING = {
    "Heading 1": 1, "제목 1": 1,
    "Heading 2": 2, "제목 2": 2,
    "Heading 3": 3, "제목 3": 3,
}

_RE_H1_DECIMAL = re.compile(r"^\d+\.\s")
_RE_H2_DECIMAL = re.compile(r"^\d+\.\d+\.\s")
_RE_H3_DECIMAL = re.compile(r"^\d+\.\d+\.\d+\.\s")
_RE_KOREAN_LETTER = re.compile(r"^[가-힣]\.\s")


def _is_bold_or_large(paragraph: Any) -> bool:
    runs = getattr(paragraph, "runs", []) or []
    for r in runs:
        if getattr(r, "bold", False):
            return True
        # 테스트용 FakeRun
        size = getattr(r, "font_size_pt", None)
        if size is not None and size >= 13:
            return True
        # 실제 docx.Run
        font = getattr(r, "font", None)
        real_size = getattr(font, "size", None) if font is not None else None
        if real_size is not None and real_size.pt >= 13:
            return True
    return False


def detect_level(paragraph: Any) -> tuple[int, DetectedBy]:
    style_name = getattr(paragraph.style, "name", "")
    if style_name in _WORD_HEADING:
        return _WORD_HEADING[style_name], "word_style"

    text = (paragraph.text or "").strip()
    if _RE_H3_DECIMAL.match(text):
        return 3, "heuristic"
    if _RE_H2_DECIMAL.match(text):
        return 2, "heuristic"
    if _RE_H1_DECIMAL.match(text) and _is_bold_or_large(paragraph):
        return 1, "heuristic"
    if _RE_KOREAN_LETTER.match(text):
        return 2, "heuristic"

    return 0, "heuristic"
