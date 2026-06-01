# Phase 1: Setup

## Overview

**Purpose:** Test framework, project structure, database indexes, and shared utilities
**Mobile Alignment:** Supports Mobile Phase 1 (Infrastructure & Foundation)
**Phase:** 1

---

## Services & Repositories

| Service | File Path | Description |
|---------|-----------|-------------|
| Base Repository | `backend/app/services/base_repo.py` | Async CRUD helpers, collection access |
| DB Indexes | `backend/app/core/db_indexes.py` | All MongoDB index definitions |

## API Endpoints

| Endpoint | Method | Status | Request Shape | Response Shape |
|----------|--------|--------|---------------|----------------|
| `/api/health` | GET | ✅ Implemented | — | `{"status": "ok"}` |

## Data Models

| Model | File Path | Description |
|-------|-----------|-------------|
| ApiError | `backend/app/models/errors.py` | Standardized error response format |
| Request DTOs | `backend/app/models/dtos.py` | RegisterRequest, LoginRequest, TokenResponse, etc. |

---

## Tests

| Test ID | Type | Test Case | File Path | Status | Notes |
|---------|------|-----------|-----------|--------|-------|
| T-001 | Contract | Health endpoint returns 200 | `backend/tests/contract/test_health.py` | ⬜ | — |
| T-002 | Unit | Password hash + verify | `backend/tests/unit/test_password.py` | ⬜ | — |
| T-003 | Unit | JWT create + decode + expiry | `backend/tests/unit/test_jwt.py` | ⬜ | — |

---

## Implementation Details

### Key Decisions

- pytest with pytest-asyncio for async test support
- mongomock for MongoDB test isolation
- httpx for async test client
- bcrypt for password hashing
- python-jose for JWT (already in use)

### Dependencies

- No dependencies — first phase
- Foundation for all subsequent phases

### Error Handling

- Standardized ApiError model with code, message, details fields
- All errors follow `{ "error": { "code": "...", "message": "..." } }` format

---

## Mobile API Contract Alignment

| Mobile Endpoint | Backend Status | Notes |
|-----------------|----------------|-------|
| Health check | ✅ Implemented | `/api/health` returns `{"status": "ok"}` |

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 1 | Initial creation | — |
