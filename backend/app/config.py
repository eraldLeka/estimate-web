from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = ""
    CORS_ALLOW_ORIGIN_REGEX: str = r"^https?://localhost(:\\d+)?$|^https?://127\\.0\\.0\\.1(:\\d+)?$"

    class Config:
        env_file = ".env"

settings = Settings()
