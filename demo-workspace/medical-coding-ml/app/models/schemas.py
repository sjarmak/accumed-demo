from pydantic import BaseModel, Field
from typing import List, Optional


class PredictionRequest(BaseModel):
    """Request model for medical code prediction."""
    
    clinical_text: str = Field(
        ...,
        description="Clinical text to extract medical codes from",
        min_length=1
    )
    context: Optional[str] = Field(
        None,
        description="Additional context or patient information"
    )
    max_predictions: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of predictions to return"
    )
    confidence_threshold: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Minimum confidence threshold for predictions"
    )


class CodePrediction(BaseModel):
    """Individual code prediction result."""
    
    code: str = Field(..., description="Predicted medical code (ICD-10, CPT, etc.)")
    description: str = Field(..., description="Description of the medical code")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    code_type: str = Field(..., description="Type of code (ICD-10, CPT, HCPCS)")


class PredictionResponse(BaseModel):
    """Response model for medical code prediction."""
    
    predictions: List[CodePrediction] = Field(
        default_factory=list,
        description="List of predicted medical codes"
    )
    processing_time_ms: float = Field(
        ...,
        description="Processing time in milliseconds"
    )
    model_version: str = Field(
        ...,
        description="Version of the ML model used"
    )
    success: bool = Field(
        default=True,
        description="Whether the prediction was successful"
    )
    error_message: Optional[str] = Field(
        None,
        description="Error message if prediction failed"
    )
