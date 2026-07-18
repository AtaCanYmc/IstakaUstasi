import uuid
from typing import Any, Dict, Optional


class JobService:
    # In-memory dictionary to store job statuses and results
    _jobs: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def create_job(cls) -> str:
        job_id = str(uuid.uuid4())
        cls._jobs[job_id] = {
            "status": "processing",
            "result": None,
            "error": None,
        }
        return job_id

    @classmethod
    def update_job_success(cls, job_id: str, result: Any) -> None:
        if job_id in cls._jobs:
            cls._jobs[job_id].update(
                {
                    "status": "completed",
                    "result": result,
                }
            )

    @classmethod
    def update_job_failure(cls, job_id: str, error: str) -> None:
        if job_id in cls._jobs:
            cls._jobs[job_id].update(
                {
                    "status": "failed",
                    "error": error,
                }
            )

    @classmethod
    def get_job(cls, job_id: str) -> Optional[Dict[str, Any]]:
        return cls._jobs.get(job_id)
