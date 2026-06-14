from fastapi import APIRouter, Depends, HTTPException, status, Request
from datetime import datetime, timedelta, timezone
import secrets

from app.core.config import settings
from app.core.auth import create_access_token, create_refresh_token, get_current_user
from app.core.password import hash_password, verify_password
from app.core.oauth import get_google_auth_url, exchange_code_for_tokens, fetch_google_user_info
from app.models.dtos import RegisterRequest, LoginRequest, GoogleAuthRequest, TokenResponse
from app.services.user_repo import UserRepo
from app.services.token_repo import TokenRepo

router = APIRouter()


def get_user_repo(request: Request) -> UserRepo:
    return UserRepo(request.app.db)


def get_token_repo(request: Request) -> TokenRepo:
    return TokenRepo(request.app.db)


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=TokenResponse)
async def register(
    req: RegisterRequest,
    user_repo: UserRepo = Depends(get_user_repo),
    token_repo: TokenRepo = Depends(get_token_repo),
):
    existing = await user_repo.find_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "AUTH_EMAIL_EXISTS", "message": "Email already registered"},
        )

    password_hash = hash_password(req.password)
    user = await user_repo.create(
        email=req.email,
        password_hash=password_hash,
        display_name=req.display_name,
    )

    access_token = create_access_token(user["_id"])
    refresh_token = create_refresh_token(user["_id"])

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await token_repo.store(user["_id"], refresh_token, expires_at)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user["_id"],
            "email": user["email"],
            "display_name": user["display_name"],
        },
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    user_repo: UserRepo = Depends(get_user_repo),
    token_repo: TokenRepo = Depends(get_token_repo),
):
    user = await user_repo.find_by_email(req.email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTH_INVALID_CREDENTIALS", "message": "Invalid email or password"},
        )

    await user_repo.update_last_login(user["_id"])

    access_token = create_access_token(user["_id"])
    refresh_token = create_refresh_token(user["_id"])

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await token_repo.store(user["_id"], refresh_token, expires_at)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user["_id"],
            "email": user["email"],
            "display_name": user["display_name"],
        },
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    req: dict,
    token_repo: TokenRepo = Depends(get_token_repo),
    user_repo: UserRepo = Depends(get_user_repo),
):
    refresh_token_str = req.get("refresh_token")
    if not refresh_token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTH_MISSING_TOKEN", "message": "Refresh token required"},
        )

    stored = await token_repo.validate(refresh_token_str)
    if not stored:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTH_INVALID_TOKEN", "message": "Invalid or expired refresh token"},
        )

    await token_repo.revoke(refresh_token_str)

    user = await user_repo.find_by_id(stored["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTH_USER_NOT_FOUND", "message": "User not found"},
        )

    new_access = create_access_token(user["_id"])
    new_refresh = create_refresh_token(user["_id"])

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await token_repo.store(user["_id"], new_refresh, expires_at)

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        user={
            "id": user["_id"],
            "email": user["email"],
            "display_name": user["display_name"],
        },
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    req: dict,
    user_id: str = Depends(get_current_user),
    token_repo: TokenRepo = Depends(get_token_repo),
):
    refresh_token_str = req.get("refresh_token")
    if refresh_token_str:
        await token_repo.revoke(refresh_token_str)
    return {"status": "logged_out"}


@router.post("/google")
async def google_auth():
    state = secrets.token_urlsafe(32)
    auth_url = get_google_auth_url(state)
    return {"auth_url": auth_url, "state": state}


@router.post("/google/callback", response_model=TokenResponse)
async def google_callback(
    req: GoogleAuthRequest,
    user_repo: UserRepo = Depends(get_user_repo),
    token_repo: TokenRepo = Depends(get_token_repo),
):
    tokens = await exchange_code_for_tokens(req.code)
    user_info = await fetch_google_user_info(tokens.get("access_token", ""))

    google_id = user_info.get("sub")
    email = user_info.get("email", "")
    display_name = user_info.get("name", email.split("@")[0])
    avatar_url = user_info.get("picture")

    user = await user_repo.find_by_google_id(google_id)
    if not user:
        existing = await user_repo.find_by_email(email)
        if existing:
            user = existing
            await user_repo.collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"google_id": google_id, "avatar_url": avatar_url}},
            )
        else:
            user = await user_repo.create(
                email=email,
                password_hash="",
                display_name=display_name,
            )
            await user_repo.collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"google_id": google_id, "avatar_url": avatar_url}},
            )

    await user_repo.update_last_login(user["_id"])

    access_token = create_access_token(user["_id"])
    refresh_token = create_refresh_token(user["_id"])

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await token_repo.store(user["_id"], refresh_token, expires_at)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user["_id"],
            "email": user["email"],
            "display_name": user["display_name"],
        },
    )
