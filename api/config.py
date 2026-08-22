import os
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "RiskRadar API"
    VERSION: str = "0.2.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Neon Postgres async connection string (Defaults to local async SQLite for zero-config local testing)
    DATABASE_URL: str = "sqlite+aiosqlite:///./riskradar_dev.db"
    
    # CORS Origin Configuration
    FRONTEND_ORIGIN: str = "http://localhost:3000,http://127.0.0.1:3000,https://risk-radar-two.vercel.app"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if isinstance(v, str):
            # Fix standard Neon postgresql:// to asyncpg Driver format postgresql+asyncpg://
            if v.startswith("postgresql://"):
                v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgres://"):
                v = v.replace("postgres://", "postgresql+asyncpg://", 1)
            
            # Convert sslmode query parameter to ssl for asyncpg compatibility
            if "sslmode=" in v:
                v = v.replace("sslmode=require", "ssl=require").replace("sslmode=prefer", "ssl=prefer").replace("sslmode=disable", "ssl=disable")
        return v

    @property
    def cors_origins(self) -> List[str]:
        if not self.FRONTEND_ORIGIN:
            return ["*"]
        return [origin.strip() for origin in self.FRONTEND_ORIGIN.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
