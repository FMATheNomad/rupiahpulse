from __future__ import annotations

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

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/rupiahpulse"

    CORS_ORIGINS: str = ""

    DATA_PROVIDER_TIMEOUT_SECONDS: int = 15

    GDELT_QUERY: str = "indonesia rupiah"

    CACHE_TTL_SECONDS_EXPLANATION: int = 300
    CACHE_TTL_SECONDS_NEWS: int = 600

    def get_cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        if self.APP_ENV == "local":
            local_origins = ["http://localhost:5173", "http://localhost:3000"]
            for o in local_origins:
                if o not in origins:
                    origins.append(o)
        return origins


settings = Settings()
