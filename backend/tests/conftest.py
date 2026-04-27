"""공용 fixture — 테스트용 DB + TestClient.

⚠️ 환경 설정은 다른 import 보다 먼저 실행되어야 한다 (`app.db.session` 이 모듈 로드 시
`get_settings()` 를 호출하면서 `Settings(database_url=...)` 가 lru_cache 로 고정됨).
즉 .env 의 운영/개발 DB URL 이 한 번이라도 cache 되면 테스트가 잘못된 호스트로 간다.
"""

import os

# 로컬 개발용 기본값. CI/운영에서는 환경변수로 override.
# pgtest 컨테이너 (예: pgtest_p2 가 호스트 15432 에 노출) 가 떠있다고 가정.
_DEFAULT_TEST_DB = "postgresql+psycopg://app:change_me@localhost:15432/word_templator"
_DEFAULT_JWT_SECRET = "test_secret_64_chars_for_dev_only_change_me_not_for_prod_a"

os.environ.setdefault("TEST_DATABASE_URL", _DEFAULT_TEST_DB)
# DATABASE_URL 은 항상 TEST_DATABASE_URL 로 강제 — .env 의 운영 DB 가
# pydantic-settings 로 새어 들어가는 것 방지.
os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]
os.environ.setdefault("JWT_SECRET", _DEFAULT_JWT_SECRET)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.api.deps import get_db  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.seed import seed_builtin_templates  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def db_engine():
    db_url = os.environ["TEST_DATABASE_URL"]
    engine = create_engine(db_url)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)


@pytest.fixture
def db_session(db_engine):
    Session = sessionmaker(bind=db_engine)
    session = Session()
    seed_builtin_templates(session)
    yield session
    session.close()


@pytest.fixture
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def _data_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    yield
