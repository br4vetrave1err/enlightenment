# Auth Flow

## Overview

**Purpose:** User authentication via email/password and Google OAuth.
**User Stories:** As a new user, I want to create an account. As an existing user, I want to log in securely.
**Phase:** 2

---

## Components

| Component | File Path | Props | Description |
|-----------|-----------|-------|-------------|
| Login Screen | `mobile/src/app/(auth)/login.tsx` | — | Email/password form + Google OAuth button |
| LoginForm | `mobile/src/features/auth/components/LoginForm.tsx` | onSubmit, loading | Reusable form with Zod validation |
| GoogleAuthButton | `mobile/src/features/auth/components/GoogleAuthButton.tsx` | onPress, disabled | Google OAuth button with space theme |
| Register Screen | `mobile/src/app/(auth)/register.tsx` | — | Registration form (email, password, display name) |
| RegisterForm | `mobile/src/features/auth/components/RegisterForm.tsx` | onSubmit, loading | Reusable form with Zod validation + password confirm |

---

## API Integration

| Endpoint | Method | Used By | Request Shape | Response Shape |
|----------|--------|---------|---------------|----------------|
| `/api/auth/login` | POST | LoginForm | `{ email, password }` | `{ access_token, refresh_token, user }` |
| `/api/auth/register` | POST | RegisterForm | `{ email, password, display_name }` | `{ access_token, refresh_token, user }` |
| `/api/auth/google` | POST | GoogleAuthButton | — | `{ auth_url }` |
| `/api/auth/google/callback` | POST | GoogleAuthButton | `{ code, state }` | `{ access_token, refresh_token, user }` |

---

## State Management

| Store | File Path | Data Managed |
|-------|-----------|--------------|
| auth-store | `mobile/src/lib/store/auth-store.ts` | Tokens stored in SecureStore, user object, isAuthenticated flag |

### Data Flow

```
LoginForm submit → POST /api/auth/login → store tokens in SecureStore
    → auth-store.update(tokens, user) → router.replace("/(tabs)/courses")
```

---

## Tests

| Test ID | Component | Test Case | Status | Notes |
|---------|-----------|-----------|--------|-------|
| T-019 | login.tsx | Renders email, password, login button, Google button | ⬜ | — |
| T-020 | login.tsx | Empty email shows "Email is required" | ⬜ | — |
| T-021 | login.tsx | Invalid email shows "Invalid email" | ⬜ | — |
| T-022 | login.tsx | Empty password shows "Password is required" | ⬜ | — |
| T-023 | login.tsx | Successful login stores tokens, navigates to courses | ⬜ | — |
| T-024 | login.tsx | Failed login shows error message from API | ⬜ | — |
| T-025 | LoginForm | Passes valid data to onSubmit | ⬜ | — |
| T-026 | LoginForm | Blocks submit on validation error | ⬜ | — |
| T-027 | GoogleAuthButton | Renders with Google icon and label | ⬜ | — |
| T-028 | GoogleAuthButton | Triggers auth action on press | ⬜ | — |
| T-029 | register.tsx | Renders email, password, display name inputs | ⬜ | — |
| T-030 | register.tsx | Password < 8 chars shows error | ⬜ | — |
| T-031 | register.tsx | Empty display name shows error | ⬜ | — |
| T-032 | register.tsx | Successful registration stores tokens, navigates | ⬜ | — |
| T-033 | register.tsx | Duplicate email shows "Email already registered" | ⬜ | — |
| T-034 | RegisterForm | Zod schema validates all fields | ⬜ | — |
| T-035 | RegisterForm | Password confirmation matches | ⬜ | — |

---

## Design Notes

### Space Theme Usage

- Forms use `HolographicCard` containers with glass-morphism
- Input fields use `spaceColors.nebula` backgrounds with `spaceColors.starlight` text
- Primary action buttons use `NebulaButton` with cosmic purple variant
- Error messages use `spaceColors.mars` (orange-red) for visibility

### Accessibility

- All inputs have `accessibilityLabel` for screen readers
- Error messages are announced via `accessibilityLiveRegion`
- Google button includes icon + text for clarity
- Form fields auto-focus in logical order

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 2 | Initial creation | — |
