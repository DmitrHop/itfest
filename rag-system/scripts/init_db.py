#!/usr/bin/env python3
"""Initialize vector database with university data."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config.config import config
from src.utils.data_loader import DataLoader
from src.services.vector_store import VectorStore
from src.utils.logger import logger


def init_database():
    """Initialize the vector database."""
    print("=" * 50)
    print("🎓 University RAG System - Database Initialization")
    print("=" * 50)
    
    try:
        # Load data
        print("\n📂 Loading university data...")
        loader = DataLoader(config.data_path)
        universities = loader.load_universities()
        
        print(f"   ✅ Loaded {len(universities)} universities")
        
        # Prepare chunks
        print("\n📝 Preparing document chunks...")
        chunks = loader.prepare_chunks(universities)
        print(f"   ✅ Created {len(chunks)} chunks")
        
        # Initialize vector store
        print("\n🔧 Initializing vector store...")
        print("   ⏳ This may take a few minutes on first run (downloading model)...")
        
        vector_store = VectorStore(
            persist_directory=config.vector_db_path,
            embedding_model_name=config.embedding_model
        )
        
        # Index documents
        print("\n📊 Indexing documents...")
        vector_store.index_documents(chunks)
        
        print("\n" + "=" * 50)
        print("✅ Database initialized successfully!")
        print(f"📁 Location: {config.vector_db_path}")
        print(f"📊 Documents: {vector_store.get_document_count()}")
        print("=" * 50)
        
        # Test search
        print("\n🔍 Testing search...")
        test_query = "IT университет в Алматы"
        results = vector_store.search(test_query, top_k=3)
        
        print(f"   Query: '{test_query}'")
        print(f"   Found: {len(results['ids'][0])} results")
        
        if results['metadatas'][0]:
            print("   Top result:", results['metadatas'][0][0]['name'])
        
        print("\n✅ All tests passed! Run 'python run.py' to start the server.")
        
    except Exception as e:
        logger.error(f"Initialization failed: {e}")
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    init_database()
