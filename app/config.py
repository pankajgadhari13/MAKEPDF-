import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
basedir = Path(__file__).resolve().parent.parent
load_dotenv(basedir / '.env')


class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'makepdf-super-secret-key-change-in-production-2026')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 
        f"sqlite:///{basedir / 'makepdf.db'}"  # Defaults to SQLite for local dev if Postgres isn't up
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Uploads and Outputs
    UPLOAD_FOLDER = basedir / os.getenv('UPLOAD_FOLDER', 'uploads')
    OUTPUT_FOLDER = basedir / os.getenv('OUTPUT_FOLDER', 'outputs')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 50 * 1024 * 1024))  # 50 MB limit

    # Allowed extensions
    ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
    ALLOWED_PDF_EXTENSIONS = {'pdf'}


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
