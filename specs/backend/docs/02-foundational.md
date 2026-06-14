# Phase 2: Foundational

## Overview

**Purpose:** Core infrastructure — password hashing, OAuth, error middleware, DB indexes — blocking prerequisites for all user stories
**Mobile Alignment:** Supports Mobile Phase 1 (Infrastructure & Foundation)
**Phase:** 2

---

## Services & Repositories

| Service | File Path | Description |
|---------|-----------|-------------|
| Password Utility | `backend/app/core/password.py` | bcrypt hash + verify functions |
| OAuth Client | `backend/app/core/oauth.py` | Google OAuth: auth URL, code exchange, user info |
| Error Middleware | `backend/app/middleware/errors.py` | Catch exceptions, return standardized ApiError |
| Base Repository | `backend/app/services/base_repo.py` | Async CRUD helpers |

## API Endpoints

| Endpoint | Method | Status | Request Shape | Response Shape |
|----------|--------|--------|---------------|----------------|
| `/api/health` | GET | ✅ Implemented | — | `{"status": "ok"}` |

## Data Models

| Model | File Path | Description |
|-------|-----------|-------------|
| ApiError | `backend/app/models/errors.py` | Error code, message, details |
| DTOs | `backend/app/models/dtos.py` | All request/response DTOs |

---

## Tests

| Test ID | Type | Test Case | File Path | Status | Notes |
|---------|------|-----------|-----------|--------|-------|
| T-004 | Unit | Password: hash produces non-plain text | `backend/tests/unit/test_password.py` | ✅ Passed | — |
| T-005 | Unit | Password: verify correct password | `backend/tests/unit/test_password.py` | ✅ Passed | — |
| T-006 | Unit | Password: verify wrong password fails | `backend/tests/unit/test_password.py` | ✅ Passed | — |
| T-007 | Unit | JWT: create and decode valid token | `backend/tests/unit/test_jwt.py` | ✅ Passed | — |
| T-008 | Unit | JWT: expired token raises error | `backend/tests/unit/test_jwt.py` | ✅ Passed | — |
| T-009 | Unit | JWT: invalid signature raises error | `backend/tests/unit/test_jwt.py` | ✅ Passed | — |
| T-010 | Unit | OAuth: generates valid auth URL | `backend/tests/unit/test_oauth.py` | ✅ Passed | — |
| T-011 | Contract | Error middleware returns ApiError format | `backend/tests/contract/test_errors.py` | ✅ Passed | — |
| T-012 | Integration | DB indexes created on startup | `backend/tests/integration/test_db_indexes.py` | ✅ Passed | — |

---

## Implementation Details

### Key Decisions

- bcrypt for password hashing (industry standard)
- Google OAuth via httpx async client
- Error middleware catches all unhandled exceptions
- DB indexes created during app lifespan startup

### Dependencies

- Depends on Phase 1 (test framework, project structure)
- Required before Phase 3 (Auth) can begin

### Error Handling

- All unhandled exceptions → 500 with ApiError format
- Validation errors → 422 with field-level details
- Auth errors → 401 with specific error codes

---

## Mobile API Contract Alignment

| Mobile Endpoint | Backend Status | Notes |
|-----------------|----------------|-------|
| Token refresh | ⬜ | `/api/auth/refresh` — foundation for auth flow |

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 2 | Initial creation | — |
| 2026-01-XX | 2 | Password hashing, OAuth, error middleware, DB indexes implemented | — |
