"""헤딩 감지 단계적 폴백 (R3)."""

from dataclasses import dataclass, field

from app.parser.detect_heading import detect_level


@dataclass
class FakeRun:
    bold: bool = False
    font_size_pt: float | None = None


@dataclass
class FakeStyle:
    name: str = "Normal"


@dataclass
class FakeParagraph:
    text: str = ""
    style: FakeStyle = field(default_factory=FakeStyle)
    runs: list[FakeRun] = field(default_factory=list)


def test_word_heading_1():
    p = FakeParagraph(text="개요", style=FakeStyle(name="Heading 1"))
    assert detect_level(p) == (1, "word_style")


def test_korean_heading_2():
    p = FakeParagraph(text="배경", style=FakeStyle(name="제목 2"))
    assert detect_level(p) == (2, "word_style")


def test_heuristic_decimal_h1_with_bold():
    p = FakeParagraph(text="1. 개요", runs=[FakeRun(bold=True, font_size_pt=14)])
    assert detect_level(p) == (1, "heuristic")


def test_heuristic_dotted_h2():
    p = FakeParagraph(text="1.1. 배경")
    assert detect_level(p) == (2, "heuristic")


def test_heuristic_korean_h2():
    p = FakeParagraph(text="가. 항목")
    assert detect_level(p) == (2, "heuristic")


def test_fallback_body():
    p = FakeParagraph(text="본문 내용입니다.")
    assert detect_level(p) == (0, "heuristic")
