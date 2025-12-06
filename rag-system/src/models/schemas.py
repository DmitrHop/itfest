"""Pydantic schemas for API."""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime


class QueryRequest(BaseModel):
    """Request model for RAG query."""
    question: str = Field(..., min_length=3, max_length=1000, description="User question")
    filters: Optional[Dict] = Field(default=None, description="Optional filters (city, category, etc.)")
    top_k: Optional[int] = Field(default=None, ge=1, le=10, description="Number of results")
    temperature: Optional[float] = Field(default=0.7, ge=0, le=1, description="LLM temperature")


class SourceDocument(BaseModel):
    """Source document from vector search."""
    id: int
    name: str
    city: str
    category: str
    relevance_score: float
    programs: str
    ent_score_range: str
    contact_info: Dict[str, str]


class RAGResponse(BaseModel):
    """Response model for RAG query."""
    answer: str
    sources: List[SourceDocument]
    processing_time: float
    cached: bool = False
    timestamp: datetime = Field(default_factory=datetime.now)


class HealthCheck(BaseModel):
    """Health check response."""
    status: str
    vector_db_count: int
    embedding_model: str
    gemini_status: str
    cache_enabled: bool
    version: str = "1.0.0"


class FilterOptions(BaseModel):
    """Available filter options."""
    cities: List[str]
    categories: List[str]
    ent_score_range: Dict[str, int]
