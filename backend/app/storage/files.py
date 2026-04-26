"""파일 경로 헬퍼 — /data/{user_id}/{job_id}/."""

import os
import uuid
from pathlib import Path


def _data_dir() -> Path:
    return Path(os.environ.get("DATA_DIR", "/data"))


def job_dir(user_id: uuid.UUID, job_id: uuid.UUID) -> Path:
    d = _data_dir() / "docs" / str(user_id) / str(job_id)
    d.mkdir(parents=True, exist_ok=True)
    return d


def source_path(user_id: uuid.UUID, job_id: uuid.UUID, original_filename: str) -> Path:
    safe = original_filename.replace("/", "_").replace("\\", "_")
    return job_dir(user_id, job_id) / f"src_{safe}"


def result_path(user_id: uuid.UUID, job_id: uuid.UUID) -> Path:
    return job_dir(user_id, job_id) / "result.docx"
