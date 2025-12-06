#!/usr/bin/env python3
"""Run the RAG system server."""

import uvicorn
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.config.config import config


def main():
    """Start the server."""
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║          🎓 University RAG System with AI Counselor          ║
╠══════════════════════════════════════════════════════════════╣
║  📍 Server: http://{config.host}:{config.port:<24}          ║
║  📚 Docs:   http://{config.host}:{config.port}/docs{' '*21}║
║  🔍 Mode:   {'Debug' if config.debug else 'Production':<44} ║
╠══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                  ║
║  • GET  /health     - System health check                    ║
║  • POST /query      - Ask the AI counselor                   ║
║  • GET  /filters    - Available filter options               ║
║  • GET  /stats      - System statistics                      ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "src.main:app",
        host=config.host,
        port=config.port,
        reload=config.debug,
        log_level="info" if config.debug else "warning"
    )


if __name__ == "__main__":
    main()
