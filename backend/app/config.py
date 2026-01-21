from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    db_name: str = ""

    use_mock_services: bool = False

    max_daily_requests: int = 50
    
    class Config:
        env_file = ".env"

settings = Settings()