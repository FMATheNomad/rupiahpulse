from __future__ import annotations

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_ENV: str = "local"
    LOG_LEVEL: str = "DEBUG"

    DATABASE_URL: str = ""

    CORS_ORIGINS: str = ""

    DATA_PROVIDER_TIMEOUT_SECONDS: int = 15

    GDELT_QUERY: str = "indonesia rupiah"

    CACHE_TTL_SECONDS_EXPLANATION: int = 300
    CACHE_TTL_SECONDS_NEWS: int = 600

    @model_validator(mode="after")
    def validate_production(self):
        if self.APP_ENV in ("staging", "production"):
            if not self.DATABASE_URL or "localhost" in self.DATABASE_URL.lower():
                raise ValueError("DATABASE_URL must point to remote DB in production")
            if not self.CORS_ORIGINS.strip():
                raise ValueError("CORS_ORIGINS is required in production")
        return self

    def get_cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        if self.APP_ENV == "local":
            local_origins = ["http://localhost:5173", "http://localhost:3000"]
            for o in local_origins:
                if o not in origins:
                    origins.append(o)
        return origins


settings = Settings()
