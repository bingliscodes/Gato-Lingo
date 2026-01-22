from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    use_mock_services: bool = False
    max_daily_requests: int = 50
    
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    db_name: str = ""

    jwt_secret: str = "your-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expires_in_minutes: int = 60 * 24 * 7  # 7 days

    frontend_url: str="http://localhost:5173"
    
    class Config:
        env_file = ".env"

settings = Settings()