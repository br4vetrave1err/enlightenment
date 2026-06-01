from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
async def login():
    pass


@router.post("/register")
async def register():
    pass


@router.post("/google")
async def google_auth():
    pass


@router.post("/refresh")
async def refresh_token():
    pass
