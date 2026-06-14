from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "roadmap_learning"
    ZEN_API_KEY: str = ""
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_WEBHOOK_SECRET: str = ""
    CORS_ORIGINS: str = "http://localhost:3000"
    APP_URL: str = "http://localhost:8080"
    ROADMAP_REPO_URL: str = "https://github.com/nilbuild/developer-roadmap.git"
    ROADMAP_REPO_BRANCH: str = "master"
    LLM_MODEL: str = "qwen3.6-plus"
    DISABLE_RATE_LIMIT: str = "false"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
