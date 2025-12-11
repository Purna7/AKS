import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///kloudmanager.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # AWS Configuration
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
    
    # Azure Configuration
    AZURE_SUBSCRIPTION_ID = os.getenv('AZURE_SUBSCRIPTION_ID')
    AZURE_TENANT_ID = os.getenv('AZURE_TENANT_ID')
    AZURE_CLIENT_ID = os.getenv('AZURE_CLIENT_ID')
    AZURE_CLIENT_SECRET = os.getenv('AZURE_CLIENT_SECRET')
    
    # GCP Configuration
    GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID')
    GCP_SERVICE_ACCOUNT_FILE = os.getenv('GCP_SERVICE_ACCOUNT_FILE')
    
    # GitHub Configuration
    GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
    GITHUB_ORGANIZATION = os.getenv('GITHUB_ORGANIZATION')
    GITHUB_USERNAME = os.getenv('GITHUB_USERNAME')
    
    # Azure DevOps Configuration
    AZUREDEVOPS_ORGANIZATION = os.getenv('AZUREDEVOPS_ORGANIZATION')
    AZUREDEVOPS_PAT = os.getenv('AZUREDEVOPS_PAT')
    AZUREDEVOPS_PROJECT = os.getenv('AZUREDEVOPS_PROJECT')
    
    # Application Settings
    REFRESH_INTERVAL = int(os.getenv('REFRESH_INTERVAL', 300))
    MAX_WORKERS = int(os.getenv('MAX_WORKERS', 5))
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_ECHO = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
