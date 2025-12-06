"""Vector store service using ChromaDB."""

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
from pathlib import Path

from src.utils.logger import logger


class VectorStore:
    """ChromaDB vector store with sentence-transformers embeddings."""
    
    def __init__(self, persist_directory: str, embedding_model_name: str = "paraphrase-multilingual-MiniLM-L12-v2"):
        self.persist_directory = Path(persist_directory)
        if not self.persist_directory.is_absolute():
            self.persist_directory = Path(__file__).parent.parent.parent / persist_directory
        
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Loading embedding model: {embedding_model_name}...")
        self.embedding_model = SentenceTransformer(embedding_model_name)
        logger.info("Embedding model loaded successfully")
        
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(
            path=str(self.persist_directory),
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="universities",
            metadata={"description": "Universities of Kazakhstan database"}
        )
        
        logger.info(f"Vector store initialized at: {self.persist_directory}")
    
    def index_documents(self, documents: List[Dict], batch_size: int = 50):
        """Index documents into vector store."""
        try:
            # Check if already indexed
            if self.collection.count() > 0:
                logger.warning("Collection already has documents. Clearing...")
                self.client.delete_collection("universities")
                self.collection = self.client.get_or_create_collection(
                    name="universities",
                    metadata={"description": "Universities of Kazakhstan database"}
                )
            
            ids = [doc["id"] for doc in documents]
            texts = [doc["text"] for doc in documents]
            metadatas = [doc["metadata"] for doc in documents]
            
            logger.info(f"Creating embeddings for {len(documents)} documents...")
            embeddings = self.embedding_model.encode(texts, show_progress_bar=True).tolist()
            
            # Add to collection in batches
            for i in range(0, len(documents), batch_size):
                batch_end = min(i + batch_size, len(documents))
                self.collection.add(
                    embeddings=embeddings[i:batch_end],
                    documents=texts[i:batch_end],
                    metadatas=metadatas[i:batch_end],
                    ids=ids[i:batch_end]
                )
            
            logger.info(f"Successfully indexed {len(documents)} documents")
            
        except Exception as e:
            logger.error(f"Error indexing documents: {e}")
            raise
    
    def search(self, query: str, top_k: int = 5, filters: Optional[Dict] = None) -> Dict:
        """Search for similar documents."""
        try:
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Build where clause for filters
            where = None
            if filters:
                where = self._build_where_clause(filters)
            
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where,
                include=["documents", "metadatas", "distances"]
            )
            
            logger.debug(f"Search query: '{query[:50]}...' returned {len(results['ids'][0])} results")
            return results
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}
    
    def _build_where_clause(self, filters: Dict) -> Optional[Dict]:
        """Build ChromaDB where clause from filters."""
        conditions = []
        
        if filters.get("city"):
            conditions.append({"city": {"$eq": filters["city"]}})
        
        if filters.get("category"):
            conditions.append({"category": {"$eq": filters["category"]}})
        
        if filters.get("min_score"):
            conditions.append({"ent_min_score": {"$lte": filters["min_score"]}})
        
        if filters.get("max_score"):
            conditions.append({"ent_max_score": {"$gte": filters["max_score"]}})
        
        if len(conditions) == 0:
            return None
        elif len(conditions) == 1:
            return conditions[0]
        else:
            return {"$and": conditions}
    
    def get_document_count(self) -> int:
        """Get number of documents in collection."""
        return self.collection.count()
    
    def delete_collection(self):
        """Delete the collection."""
        self.client.delete_collection("universities")
        logger.info("Collection deleted")
