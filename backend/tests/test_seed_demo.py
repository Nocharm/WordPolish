"""seed_demo_accounts / seed_demo_job 단위 + idempotency."""

from app.db.models import User
from app.db.seed import (
    DEMO_ADMIN_EMAIL,
    DEMO_ADMIN_PASSWORD,
    DEMO_USER_EMAIL,
    DEMO_USER_PASSWORD,
    seed_demo_accounts,
)
from app.core.security import verify_password


def test_seed_demo_accounts_creates_admin_and_user(db_session):
    seed_demo_accounts(db_session)
    admin = db_session.query(User).filter_by(email=DEMO_ADMIN_EMAIL).one()
    user = db_session.query(User).filter_by(email=DEMO_USER_EMAIL).one()
    assert admin.role == "admin"
    assert user.role == "user"
    assert verify_password(DEMO_ADMIN_PASSWORD, admin.password_hash)
    assert verify_password(DEMO_USER_PASSWORD, user.password_hash)


def test_seed_demo_accounts_is_idempotent(db_session):
    seed_demo_accounts(db_session)
    seed_demo_accounts(db_session)
    seed_demo_accounts(db_session)
    assert db_session.query(User).filter_by(email=DEMO_ADMIN_EMAIL).count() == 1
    assert db_session.query(User).filter_by(email=DEMO_USER_EMAIL).count() == 1


def test_seed_demo_accounts_skips_when_user_already_exists(db_session):
    # 사용자가 이미 admin@local.test 로 가입한 상태를 가정 — 비밀번호 덮어쓰지 않음
    from app.core.security import hash_password
    db_session.add(User(
        email=DEMO_ADMIN_EMAIL,
        password_hash=hash_password("custom_password"),
        role="admin",
    ))
    db_session.commit()
    seed_demo_accounts(db_session)
    admin = db_session.query(User).filter_by(email=DEMO_ADMIN_EMAIL).one()
    assert verify_password("custom_password", admin.password_hash)
