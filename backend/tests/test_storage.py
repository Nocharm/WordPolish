"""storage.files 경로 헬퍼."""

import uuid

from app.storage.files import job_dir, source_path, result_path


def test_paths_are_under_data_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    user_id = uuid.uuid4()
    job_id = uuid.uuid4()
    d = job_dir(user_id, job_id)
    assert str(d).startswith(str(tmp_path))
    assert d.exists()


def test_source_and_result_paths_distinct(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    user_id = uuid.uuid4()
    job_id = uuid.uuid4()
    src = source_path(user_id, job_id, "report.docx")
    res = result_path(user_id, job_id)
    assert src != res
    assert src.suffix == ".docx"
    assert res.suffix == ".docx"
