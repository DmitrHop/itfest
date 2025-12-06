"""Configuration module for RAG system."""

import os
from pathlib import Path
from dataclasses import dataclass
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)


@dataclass
class Config:
    """Application configuration."""
    
    # Gemini
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # Paths
    data_path: str = os.getenv("DATA_PATH", "../universities_frontend.json")
    vector_db_path: str = os.getenv("VECTOR_DB_PATH", "./data/vector_db")
    
    # Embedding
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")
    embedding_dimension: int = int(os.getenv("EMBEDDING_DIMENSION", 384))
    
    # RAG Settings
    top_k_results: int = int(os.getenv("TOP_K_RESULTS", 5))
    similarity_threshold: float = float(os.getenv("SIMILARITY_THRESHOLD", 0.7))
    max_context_length: int = int(os.getenv("MAX_CONTEXT_LENGTH", 4000))
    
    # Rate Limiting
    max_requests_per_minute: int = int(os.getenv("MAX_REQUESTS_PER_MINUTE", 15))
    cache_ttl: int = int(os.getenv("CACHE_TTL", 3600))
    
    # Features
    enable_cache: bool = os.getenv("ENABLE_CACHE", "true").lower() == "true"
    enable_fallback: bool = os.getenv("ENABLE_FALLBACK", "false").lower() == "true"
    
    # Server
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    def validate(self) -> bool:
        """Validate required configuration."""
        if not self.gemini_api_key or self.gemini_api_key == "your_gemini_api_key_here":
            raise ValueError("GEMINI_API_KEY is not set in .env file")
        return True


config = Config()
