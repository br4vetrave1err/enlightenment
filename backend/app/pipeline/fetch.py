"""FETCH step — compare SHA and clone/pull roadmap repo."""

from dataclasses import dataclass
from typing import Optional
import subprocess
import os
import tempfile

from app.core.config import settings


@dataclass
class FetchResult:
    sha: str
    changed: bool
    repo_path: str
    previous_sha: Optional[str] = None


async def fetch_content(
    previous_sha: Optional[str] = None,
    repo_url: Optional[str] = None,
) -> FetchResult:
    """Clone or pull the roadmap repo and return SHA + changed status."""
    url = repo_url or settings.ROADMAP_REPO_URL
    repo_path = tempfile.mkdtemp(prefix="roadmap_sync_")

    if previous_sha:
        if os.path.exists(os.path.join(repo_path, ".git")):
            result = subprocess.run(
                ["git", "-C", repo_path, "pull"],
                capture_output=True, text=True, timeout=120,
            )
        else:
            result = subprocess.run(
                ["git", "clone", "--depth", "1", "--single-branch", url, repo_path],
                capture_output=True, text=True, timeout=120,
            )
    else:
        result = subprocess.run(
            ["git", "clone", "--depth", "1", "--single-branch", url, repo_path],
            capture_output=True, text=True, timeout=120,
        )

    if result.returncode != 0:
        raise RuntimeError(f"Git clone/pull failed: {result.stderr}")

    sha_result = subprocess.run(
        ["git", "-C", repo_path, "rev-parse", "HEAD"],
        capture_output=True, text=True,
    )
    current_sha = sha_result.stdout.strip()

    return FetchResult(
        sha=current_sha,
        changed=current_sha != previous_sha,
        repo_path=repo_path,
        previous_sha=previous_sha,
    )
