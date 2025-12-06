"""FastAPI main application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.config.config import config
from src.models.schemas import QueryRequest, RAGResponse, HealthCheck, FilterOptions
from src.services.rag_pipeline import RAGPipeline
from src.utils.logger import logger
from src.utils.data_loader import DataLoader


# Global pipeline instance
rag_pipeline: RAGPipeline = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    global rag_pipeline
    
    logger.info("🚀 Starting University RAG System...")
    
    try:
        # Validate config
        config.validate()
        
        # Initialize RAG pipeline
        rag_pipeline = RAGPipeline()
        
        logger.info("✅ RAG System ready to serve requests")
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize: {e}")
        raise
    finally:
        logger.info("👋 Shutting down RAG System")


# Create FastAPI app
app = FastAPI(
    title="University RAG System",
    description="RAG-система для поиска университетов Казахстана с AI-профориентологом",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if config.debug else None,
    redoc_url="/redoc" if config.debug else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "University RAG System API",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthCheck, tags=["Health"])
async def health_check():
    """Check system health."""
    if not rag_pipeline:
        raise HTTPException(status_code=503, detail="RAG pipeline not initialized")
    
    stats = rag_pipeline.get_stats()
    gemini_status = rag_pipeline.llm_service.check_health()
    
    return HealthCheck(
        status="healthy" if gemini_status == "connected" else "degraded",
        vector_db_count=stats["vector_db_count"],
        embedding_model=config.embedding_model,
        gemini_status=gemini_status,
        cache_enabled=stats["cache_enabled"]
    )


@app.post("/query", response_model=RAGResponse, tags=["RAG"])
async def query(request: QueryRequest):
    """
    Main RAG query endpoint.
    
    Send a question about universities and get AI-powered recommendations.
    """
    if not rag_pipeline:
        raise HTTPException(status_code=503, detail="RAG pipeline not initialized")
    
    try:
        response = rag_pipeline.process(request)
        return response
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/filters", response_model=FilterOptions, tags=["Filters"])
async def get_filters():
    """Get available filter options."""
    try:
        loader = DataLoader(config.data_path)
        filters = loader.load_filters()
        
        return FilterOptions(
            cities=filters.get("cities", []),
            categories=filters.get("categories", []),
            ent_score_range=filters.get("ent_score_range", {"min": 50, "max": 100})
        )
    except Exception as e:
        logger.error(f"Error loading filters: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cache/clear", tags=["Cache"])
async def clear_cache():
    """Clear the response cache."""
    if not rag_pipeline:
        raise HTTPException(status_code=503, detail="RAG pipeline not initialized")
    
    rag_pipeline.clear_cache()
    return {"message": "Cache cleared successfully"}


@app.get("/stats", tags=["Stats"])
async def get_stats():
    """Get system statistics."""
    if not rag_pipeline:
        raise HTTPException(status_code=503, detail="RAG pipeline not initialized")
    
    return rag_pipeline.get_stats()
