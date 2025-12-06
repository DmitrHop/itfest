"""Logging configuration with Loguru."""

import sys
from pathlib import Path
from loguru import logger

# Remove default handler
logger.remove()

# Log format
LOG_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<level>{message}</level>"
)

# Console handler
logger.add(
    sys.stdout,
    format=LOG_FORMAT,
    level="INFO",
    colorize=True
)

# File handler
log_path = Path(__file__).parent.parent.parent / "logs" / "rag_system.log"
logger.add(
    log_path,
    format=LOG_FORMAT,
    level="DEBUG",
    rotation="10 MB",
    retention="7 days",
    compression="zip"
)

# Export logger
__all__ = ["logger"]
