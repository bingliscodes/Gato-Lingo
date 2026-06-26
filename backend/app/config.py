from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    use_mock_services: bool = True
    max_daily_requests: int = 50

    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    db_name: str = ""

    pguser: str = ""
    pgpassword: str = ""
    pghost: str = ""
    pgdatabase: str = ""
    pgsslmode: str = "require"
    pgchannelbinding: str = "require"

    environment_mode: str = "development"

    jwt_secret: str = "your-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expires_in_minutes: int = 60 * 24 * 7  # 7 days

    secret_key: str = "super-secret-key"

    frontend_url: str = "http://localhost:5173"

    redis_url: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
