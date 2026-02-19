from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MAPBOX_ACCESS_TOKEN: str
    DB_NAME: str = "ev_ml_db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
