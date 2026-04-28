# Claude Code Template

Claude Code 프로젝트용 공통 규칙 템플릿.
새 프로젝트 루트에 이 레포의 파일을 복사한 뒤, `CLAUDE.md` 의 `Commands` 섹션만 프로젝트에 맞게 채워 넣으면 된다. Claude Code 가 `CLAUDE.md` 를 자동으로 읽고, 허브에서 `@import` 되는 `rules/*.md` 까지 모두 컨텍스트로 로드한다.

## 구성

| 파일/폴더 | 역할 |
|-----------|------|
| `CLAUDE.md` | 허브. 프로젝트 설명 + Commands + 규칙 `@import` 목록 |
| `rules/` | 일반 규칙 (주석·설정·Docker·테스트·Git·보안·의존성·동기화·에러 처리) |
| `rules/languages/` | 언어/프레임워크 규칙 (Python, TypeScript, Next.js) |
| `rules/styling/` | 스타일링 규칙 (CSS, Tailwind) |
| `templates/` | 프로젝트 시작 시 채우는 템플릿 (디자인 토큰 등) |
| `USAGE.md` | 상세 사용 가이드 (한국어) |
| `.gitignore` | Claude 로컬 파일·env·OS·언어별 산출물 제외 |

## Quick Start

```bash
# 1) 템플릿을 새 프로젝트 루트에 복사 (예: cp -r 또는 clone)
cp -r /path/to/this/repo/* ~/new-project/
cp /path/to/this/repo/.gitignore ~/new-project/

# 2) CLAUDE.md 의 Commands 섹션을 실제 명령어로 채우기
#    (사용하지 않는 @rules/languages/*.md 줄은 삭제)

# 3) 커밋
cd ~/new-project
git add CLAUDE.md rules/ .gitignore
git commit -m "docs: add Claude Code project rules"
```

상세 절차·예시·FAQ 는 `USAGE.md` 참고.

## 허브 구조를 쓰는 이유

- `CLAUDE.md` 는 항상 짧게 유지 → 프로젝트 overview 가 한눈에 들어온다
- 규칙을 바꿔도 허브는 건드리지 않는다 (`rules/*.md` 만 수정)
- 규칙을 끄려면 `@import` 한 줄만 지운다
- 언어별 규칙은 `rules/languages/` 로 분리해 일반 규칙과 시각적으로 구분

## 실행

```bash
# 1. 환경변수 채우기
cp .env.example .env
# JWT_SECRET 을 실제 값으로 채움 — openssl rand -hex 32

# 2. 도커 컴포즈 기동
docker compose -f infra/docker-compose.yml up -d --build

# 3. 접속
# http://localhost           — Nginx → Next.js (UI)
# http://localhost/api/health — FastAPI (백엔드 헬스체크)
```

### 초기 로그인 계정 (시연용)

부팅 시 자동으로 생성됩니다. **운영 환경에서는 즉시 비밀번호를 변경하세요.**

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | `admin@local.test` | `admin1234` |
| 일반 사용자 | `user@local.test` | `user1234` |

### 데모 SOP 문서

`user@local.test` 로 로그인하면 `Demo SOP (시연용 30p).docx` 라는 작업이 미리 등록되어 있습니다.
30 페이지 분량의 SOP 샘플로, 4단 헤딩 · 표 · 그림 · 섹션 방향 전환을 포함합니다.
업로드가 차단된 환경에서도 편집기 / 미리보기 / 다운로드 전체 플로우를 시연할 수 있습니다.

## 개발

```bash
# Backend
cd backend
python3.11 -m venv .venv && . .venv/bin/activate
uv pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev   # http://localhost:3000
```

## 테스트

```bash
# Backend (SQLite in-memory — 외부 DB 불필요)
cd backend && pytest -v

# Frontend
cd frontend && npm run lint && npm run build
```
