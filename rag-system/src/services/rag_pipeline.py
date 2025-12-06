"""RAG Pipeline with caching and logging."""

import time
import hashlib
from datetime import datetime
from typing import List, Dict, Optional

from src.config.config import config
from src.models.schemas import QueryRequest, RAGResponse, SourceDocument
from src.services.vector_store import VectorStore
from src.services.llm_service import LLMService
from src.utils.logger import logger


class RAGPipeline:
    """Complete RAG pipeline with caching support."""
    
    def __init__(self):
        logger.info("Initializing RAG Pipeline...")
        
        # Initialize components
        self.vector_store = VectorStore(
            persist_directory=config.vector_db_path,
            embedding_model_name=config.embedding_model
        )
        
        self.llm_service = LLMService(api_key=config.gemini_api_key)
        
        # Cache
        self.cache: Dict[str, RAGResponse] = {}
        self.cache_enabled = config.enable_cache
        
        logger.info("RAG Pipeline initialized successfully")
    
    def _get_cache_key(self, question: str, filters: Optional[Dict] = None) -> str:
        """Generate cache key from question and filters."""
        key_data = question.lower().strip()
        if filters:
            key_data += str(sorted(filters.items()))
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def process(self, request: QueryRequest) -> RAGResponse:
        """Process RAG query with optional caching."""
        start_time = time.time()
        
        # Check cache
        cache_key = self._get_cache_key(request.question, request.filters)
        if self.cache_enabled and cache_key in self.cache:
            cached_response = self.cache[cache_key]
            cached_response.cached = True
            cached_response.processing_time = time.time() - start_time
            logger.info(f"Cache hit for query: '{request.question[:50]}...'")
            return cached_response
        
        try:
            logger.info(f"Processing query: '{request.question[:50]}...'")
            
            # Step 1: Parse filters
            filters = self._parse_filters(request.filters)
            top_k = request.top_k or config.top_k_results
            
            # Step 2: Vector search
            search_results = self.vector_store.search(
                query=request.question,
                top_k=top_k,
                filters=filters
            )
            
            if not search_results['documents'][0]:
                return self._create_empty_response(start_time)
            
            # Step 3: Prepare context
            context, sources = self._prepare_context(search_results)
            
            # Step 4: Generate answer via LLM
            answer, tokens_used = self.llm_service.generate_answer(
                question=request.question,
                context=context,
                temperature=request.temperature or 0.7
            )
            
            # Step 5: Create response
            response = RAGResponse(
                answer=answer,
                sources=sources,
                processing_time=time.time() - start_time,
                cached=False,
                timestamp=datetime.now()
            )
            
            # Cache response
            if self.cache_enabled:
                self.cache[cache_key] = response
            
            logger.info(f"Query processed in {response.processing_time:.2f}s")
            return response
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return self._create_error_response(start_time, str(e))
    
    def _parse_filters(self, filters: Optional[Dict]) -> Optional[Dict]:
        """Parse and validate filters."""
        if not filters:
            return None
        
        parsed = {}
        if filters.get("city"):
            parsed["city"] = filters["city"]
        if filters.get("category"):
            parsed["category"] = filters["category"]
        if filters.get("min_score"):
            parsed["min_score"] = int(filters["min_score"])
        if filters.get("max_score"):
            parsed["max_score"] = int(filters["max_score"])
        
        return parsed if parsed else None
    
    def _prepare_context(self, search_results: Dict) -> tuple[str, List[SourceDocument]]:
        """Prepare context from search results."""
        sources = []
        context_parts = []
        
        for i, (doc, metadata, distance) in enumerate(zip(
            search_results['documents'][0],
            search_results['metadatas'][0],
            search_results['distances'][0]
        )):
            # Calculate relevance score (1 - distance for cosine)
            relevance_score = max(0, 1 - distance)
            
            # Create source document
            source = SourceDocument(
                id=metadata['id'],
                name=metadata['name'],
                city=metadata['city'],
                category=metadata['category'],
                relevance_score=round(relevance_score, 3),
                programs=metadata['programs'],
                ent_score_range=f"{metadata['ent_min_score']}-{metadata['ent_max_score']}",
                contact_info={
                    "phone": metadata.get('phone', ''),
                    "email": metadata.get('email', ''),
                    "address": metadata.get('address', '')
                }
            )
            sources.append(source)
            
            # Add to context
            context_parts.append(f"[Университет {i+1}]:\n{doc}")
        
        context = "\n\n---\n\n".join(context_parts)
        
        # Truncate if too long
        if len(context) > config.max_context_length:
            context = context[:config.max_context_length] + "\n\n[...контекст обрезан...]"
        
        return context, sources
    
    def _create_empty_response(self, start_time: float) -> RAGResponse:
        """Create response when no results found."""
        return RAGResponse(
            answer="К сожалению, по вашему запросу не найдено подходящих университетов. "
                   "Попробуйте изменить параметры поиска или уточнить вопрос.",
            sources=[],
            processing_time=time.time() - start_time,
            timestamp=datetime.now()
        )
    
    def _create_error_response(self, start_time: float, error: str) -> RAGResponse:
        """Create error response."""
        return RAGResponse(
            answer=f"Произошла ошибка при обработке запроса: {error}",
            sources=[],
            processing_time=time.time() - start_time,
            timestamp=datetime.now()
        )
    
    def clear_cache(self):
        """Clear the response cache."""
        self.cache.clear()
        logger.info("Cache cleared")
    
    def get_stats(self) -> Dict:
        """Get pipeline statistics."""
        return {
            "vector_db_count": self.vector_store.get_document_count(),
            "cache_size": len(self.cache),
            "cache_enabled": self.cache_enabled
        }
