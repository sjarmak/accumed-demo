"""
Tests for medical code prediction functionality.
"""

import pytest
from medical_coding_ml.models.predictor import MedicalCodePredictor


class TestMedicalCodePredictor:
    """Test suite for medical code prediction."""
    
    @pytest.fixture
    def predictor(self):
        """Create a predictor instance for testing."""
        return MedicalCodePredictor()
    
    def test_predictor_initialization(self, predictor):
        """Test that predictor initializes correctly."""
        assert predictor is not None
        assert hasattr(predictor, 'model')
    
    def test_predict_returns_list(self, predictor):
        """Test that predict method returns a list of codes."""
        sample_text = "Patient presents with acute bronchitis"
        result = predictor.predict(sample_text)
        assert isinstance(result, list)
    
    def test_predict_with_empty_input(self, predictor):
        """Test prediction with empty input."""
        with pytest.raises(ValueError):
            predictor.predict("")
    
    def test_predict_returns_valid_codes(self, predictor):
        """Test that predicted codes are in valid format."""
        sample_text = "Patient diagnosed with type 2 diabetes mellitus"
        result = predictor.predict(sample_text)
        for code in result:
            assert isinstance(code, str)
            assert len(code) > 0
    
    # NOTE: Missing test coverage for confidence threshold feature
    # This gap is intentional for demo purposes
