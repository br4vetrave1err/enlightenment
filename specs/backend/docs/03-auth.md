# Phase 3: Auth

## Overview

**Purpose:** User registration, login, Google OAuth, token management (access + refresh + logout)
**Mobile Alignment:** Supports Mobile Phase 2 (Auth Flow)
**Phase:** 3

---

## Services & Repositories

| Service | File Path | Description |
|---------|-----------|-------------|
| User Repository | `backend/app/services/user_repo.py` | create, find_by_email, find_by_google_id, update_last_login |
| Token Repository | `backend/app/services/token_repo.py` | store refresh token, validate, revoke, cleanup expired |

## API Endpoints

| Endpoint | Method | Status | Request Shape | Response Shape |
|----------|--------|--------|---------------|----------------|
| `/api/auth/register` | POST | ⬜ | `{ email, password, display_name }` | `{ access_token, refresh_token, user }` |
| `/api/auth/login` | POST | ⬜ | `{ email, password }` | `{ access_token, refresh_token, user }` |
| `/api/auth/google` | POST | ⬜ | — | `{ auth_url }` |
| `/api/auth/google/callback` | POST | ⬜ | `{ code, state }` | `{ access_token, refresh_token, user }` |
| `/api/auth/refresh` | POST | ⬜ | `{ refresh_token }` | `{ access_token, refresh_token }` |
| `/api/auth/logout` | POST | ⬜ | — | `{ status: "ok" }` |

## Data Models

| Model | File Path | Description |
|-------|-----------|-------------|
| User | `backend/app/models/__init__.py` | Already defined — email, password_hash, google_id, display_name |
| RegisterRequest | `backend/app/models/dtos.py` | email, password, display_name with validation |
| LoginRequest | `backend/app/models/dtos.py` | email, password |
| TokenResponse | `backend/app/models/dtos.py` | access_token, refresh_token, user |

---

## Tests

| Test ID | Type | Test Case | File Path | Status | Notes |
|---------|------|-----------|-----------|--------|-------|
| T-013 | Contract | Register: 201 with tokens + user | `backend/tests/contract/test_auth_register.py` | ⬜ | — |
| T-014 | Contract | Register: 409 duplicate email | `backend/tests/contract/test_auth_register.py` | ⬜ | — |
| T-015 | Contract | Register: 422 invalid email format | `backend/tests/contract/test_auth_register.py` | ⬜ | — |
| T-016 | Contract | Register: 422 password < 8 chars | `backend/tests/contract/test_auth_register.py` | ⬜ | — |
| T-017 | Contract | Login: 200 with tokens | `backend/tests/contract/test_auth_login.py` | ⬜ | — |
| T-018 | Contract | Login: 401 wrong password | `backend/tests/contract/test_auth_login.py` | ⬜ | — |
| T-019 | Contract | Login: 401 nonexistent email | `backend/tests/contract/test_auth_login.py` | ⬜ | — |
| T-020 | Contract | Refresh: 200 new token pair | `backend/tests/contract/test_auth_refresh.py` | ⬜ | — |
| T-021 | Contract | Refresh: 401 invalid token | `backend/tests/contract/test_auth_refresh.py` | ⬜ | — |
| T-022 | Contract | Refresh: 401 expired token | `backend/tests/contract/test_auth_refresh.py` | ⬜ | — |
| T-023 | Contract | Logout: 200 revokes token | `backend/tests/contract/test_auth_logout.py` | ⬜ | — |
| T-024 | Contract | Logout: 401 without auth header | `backend/tests/contract/test_auth_logout.py` | ⬜ | — |
| T-025 | Contract | Google: 200 returns auth_url | `backend/tests/contract/test_auth_google.py` | ⬜ | — |
| T-026 | Contract | Google callback: 200 with tokens | `backend/tests/contract/test_auth_google.py` | ⬜ | — |
| T-027 | Integration | Full auth flow: register → login → refresh → logout | `backend/tests/integration/test_auth_flow.py` | ⬜ | — |
| T-028 | Integration | Google OAuth flow: get URL → callback → login | `backend/tests/integration/test_auth_google_flow.py` | ⬜ | — |

---

## Implementation Details

### Key Decisions

- Email uniqueness enforced at DB level (unique index)
- Password validation: min 8 chars, email format check
- Refresh token rotation: old token revoked on refresh
- Google OAuth: state parameter for CSRF protection
- User model created on first Google login (no separate registration needed)

### Dependencies

- Depends on Phase 2 (password hashing, OAuth client, error middleware)
- Required by Phase 5 (Courses), Phase 6 (Progress), Phase 7 (Chat)

### Error Handling

- AUTH_DUPLICATE_EMAIL (409) — email already registered
- AUTH_INVALID_CREDENTIALS (401) — wrong email or password
- AUTH_INVALID_TOKEN (401) — expired or malformed token
- AUTH_TOKEN_REVOKED (401) — token was logged out
- AUTH_GOOGLE_FAILED (502) — Google OAuth exchange failed

---

## Mobile API Contract Alignment

| Mobile Endpoint | Backend Status | Notes |
|-----------------|----------------|-------|
| `POST /api/auth/register` | ⬜ | Matches mobile spec exactly |
| `POST /api/auth/login` | ⬜ | Matches mobile spec exactly |
| `POST /api/auth/google` | ⬜ | Returns auth_url for browser open |
| `POST /api/auth/google/callback` | ⬜ | Accepts code + state from mobile |
| `POST /api/auth/refresh` | ⬜ | Token rotation for auto-refresh |
| `POST /api/auth/logout` | ⬜ | Clears tokens on mobile SecureStore |

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 3 | Initial creation | — |
