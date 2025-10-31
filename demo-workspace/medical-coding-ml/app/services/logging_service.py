"""
Structured logging service for medical coding ML application.
"""

import logging
import sys
from typing import Any, Dict, Optional
import json
from datetime import datetime


class StructuredLogger:
    """Structured logger with JSON formatting for production environments."""
    
    def __init__(self, name: str, level: int = logging.INFO):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        
        # Remove existing handlers
        self.logger.handlers.clear()
        
        # Create console handler with structured formatting
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredFormatter())
        self.logger.addHandler(handler)
    
    def _build_log_entry(
        self, 
        level: str, 
        message: str, 
        extra: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Build structured log entry."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "message": message,
            "service": "medical-coding-ml"
        }
        
        if extra:
            log_entry.update(extra)
        
        return log_entry
    
    def info(self, message: str, **kwargs):
        """Log info message with structured data."""
        log_data = self._build_log_entry("INFO", message, kwargs)
        self.logger.info(json.dumps(log_data))
    
    def error(self, message: str, **kwargs):
        """Log error message with structured data."""
        log_data = self._build_log_entry("ERROR", message, kwargs)
        self.logger.error(json.dumps(log_data))
    
    def warning(self, message: str, **kwargs):
        """Log warning message with structured data."""
        log_data = self._build_log_entry("WARNING", message, kwargs)
        self.logger.warning(json.dumps(log_data))
    
    def debug(self, message: str, **kwargs):
        """Log debug message with structured data."""
        log_data = self._build_log_entry("DEBUG", message, kwargs)
        self.logger.debug(json.dumps(log_data))


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON string."""
        # If message is already JSON, return as-is
        try:
            json.loads(record.getMessage())
            return record.getMessage()
        except (json.JSONDecodeError, ValueError):
            # Otherwise, wrap in JSON structure
            log_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "level": record.levelname,
                "message": record.getMessage(),
                "module": record.module,
                "service": "medical-coding-ml"
            }
            return json.dumps(log_entry)


def get_logger(name: str, level: int = logging.INFO) -> StructuredLogger:
    """
    Get a structured logger instance.
    
    Args:
        name: Logger name (typically __name__)
        level: Logging level (default: INFO)
    
    Returns:
        StructuredLogger instance
    """
    return StructuredLogger(name, level)


# Default logger instance
logger = get_logger(__name__)
