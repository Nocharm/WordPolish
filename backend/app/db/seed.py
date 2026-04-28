"""빌트인 StyleSpec 시드 + 시연용 계정/Job 시드 — idempotent."""

import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.models import Template, User

SEED_DIR = Path(__file__).resolve().parent.parent / "templates_seed"

# 시연/QA 전용 계정 — README 에 노출. 운영 환경에서는 즉시 비밀번호 변경.
DEMO_ADMIN_EMAIL = "admin@local.test"
DEMO_ADMIN_PASSWORD = "admin1234"
DEMO_USER_EMAIL = "user@local.test"
DEMO_USER_PASSWORD = "user1234"


def seed_builtin_templates(db: Session) -> None:
    for path in sorted(SEED_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        existing = db.query(Template).filter_by(is_builtin=True, name=data["name"]).one_or_none()
        if existing is None:
            db.add(Template(name=data["name"], is_builtin=True, spec=data["spec"]))
        else:
            # 빌트인은 시드 JSON을 단일 출처로 — 매 부팅 시 spec 갱신
            existing.spec = data["spec"]
    db.commit()


def seed_demo_accounts(db: Session) -> None:
    """admin/user 시연 계정을 빈 DB 에 1회 생성. 이미 존재하면 건드리지 않음."""
    _ensure_user(db, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, role="admin")
    _ensure_user(db, DEMO_USER_EMAIL, DEMO_USER_PASSWORD, role="user")
    db.commit()


def _ensure_user(db: Session, email: str, password: str, *, role: str) -> None:
    if db.query(User).filter_by(email=email).one_or_none() is not None:
        return
    db.add(User(email=email, password_hash=hash_password(password), role=role))
