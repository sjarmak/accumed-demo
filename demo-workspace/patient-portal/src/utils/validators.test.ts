import { describe, it, expect } from 'vitest';
import {
  validateICD10Code,
  validateCPTCode,
  validateICD10Batch,
  validateCPTBatch
} from './validators';

describe('validateICD10Code', () => {
  describe('valid ICD-10 codes', () => {
    it('should accept basic 3-character code (letter + 2 digits)', () => {
      expect(validateICD10Code('A12')).toBe(true);
      expect(validateICD10Code('Z99')).toBe(true);
    });

    it('should accept code with decimal and 1 character', () => {
      expect(validateICD10Code('A12.1')).toBe(true);
      expect(validateICD10Code('B34.2')).toBe(true);
    });

    it('should accept code with decimal and 2 characters', () => {
      expect(validateICD10Code('C45.12')).toBe(true);
      expect(validateICD10Code('D56.AB')).toBe(true);
    });

    it('should accept code with decimal and 3 characters', () => {
      expect(validateICD10Code('E78.123')).toBe(true);
      expect(validateICD10Code('F90.ABC')).toBe(true);
    });

    it('should accept code with decimal and 4 characters', () => {
      expect(validateICD10Code('G12.1234')).toBe(true);
      expect(validateICD10Code('H35.ABCD')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(validateICD10Code('a12')).toBe(true);
      expect(validateICD10Code('a12.1')).toBe(true);
      expect(validateICD10Code('A12.abc')).toBe(true);
    });

    it('should trim whitespace', () => {
      expect(validateICD10Code('  A12  ')).toBe(true);
      expect(validateICD10Code('  A12.1  ')).toBe(true);
    });
  });

  describe('invalid ICD-10 codes', () => {
    it('should reject null or undefined', () => {
      expect(validateICD10Code(null as any)).toBe(false);
      expect(validateICD10Code(undefined as any)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateICD10Code('')).toBe(false);
      expect(validateICD10Code('   ')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(validateICD10Code(123 as any)).toBe(false);
      expect(validateICD10Code({} as any)).toBe(false);
      expect(validateICD10Code([] as any)).toBe(false);
    });

    it('should reject codes starting with digit', () => {
      expect(validateICD10Code('1A2')).toBe(false);
      expect(validateICD10Code('123')).toBe(false);
    });

    it('should reject codes with less than 3 characters', () => {
      expect(validateICD10Code('A1')).toBe(false);
      expect(validateICD10Code('AB')).toBe(false);
      expect(validateICD10Code('A')).toBe(false);
    });

    it('should reject codes with non-digit after first letter', () => {
      expect(validateICD10Code('AAA')).toBe(false);
      expect(validateICD10Code('A1B')).toBe(false);
      expect(validateICD10Code('AB2')).toBe(false);
    });

    it('should reject codes with decimal but no suffix', () => {
      expect(validateICD10Code('A12.')).toBe(false);
    });

    it('should reject codes with decimal and more than 4 suffix characters', () => {
      expect(validateICD10Code('A12.12345')).toBe(false);
      expect(validateICD10Code('A12.ABCDE')).toBe(false);
    });

    it('should reject codes without decimal but with extra characters', () => {
      expect(validateICD10Code('A123')).toBe(false);
      expect(validateICD10Code('A12AB')).toBe(false);
    });

    it('should reject codes with special characters', () => {
      expect(validateICD10Code('A12-1')).toBe(false);
      expect(validateICD10Code('A12_1')).toBe(false);
      expect(validateICD10Code('A12#1')).toBe(false);
    });

    it('should reject codes with multiple decimals', () => {
      expect(validateICD10Code('A12.1.2')).toBe(false);
    });
  });
});

describe('validateCPTCode', () => {
  describe('valid CPT codes', () => {
    it('should accept 5-digit codes', () => {
      expect(validateCPTCode('99213')).toBe(true);
      expect(validateCPTCode('12345')).toBe(true);
      expect(validateCPTCode('00000')).toBe(true);
      expect(validateCPTCode('99999')).toBe(true);
    });

    it('should trim whitespace', () => {
      expect(validateCPTCode('  99213  ')).toBe(true);
      expect(validateCPTCode('  12345  ')).toBe(true);
    });
  });

  describe('invalid CPT codes', () => {
    it('should reject null or undefined', () => {
      expect(validateCPTCode(null as any)).toBe(false);
      expect(validateCPTCode(undefined as any)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateCPTCode('')).toBe(false);
      expect(validateCPTCode('   ')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(validateCPTCode(12345 as any)).toBe(false);
      expect(validateCPTCode({} as any)).toBe(false);
      expect(validateCPTCode([] as any)).toBe(false);
    });

    it('should reject codes with less than 5 digits', () => {
      expect(validateCPTCode('1234')).toBe(false);
      expect(validateCPTCode('123')).toBe(false);
      expect(validateCPTCode('12')).toBe(false);
      expect(validateCPTCode('1')).toBe(false);
    });

    it('should reject codes with more than 5 digits', () => {
      expect(validateCPTCode('123456')).toBe(false);
      expect(validateCPTCode('1234567')).toBe(false);
    });

    it('should reject codes with letters', () => {
      expect(validateCPTCode('1234A')).toBe(false);
      expect(validateCPTCode('A2345')).toBe(false);
      expect(validateCPTCode('12A45')).toBe(false);
    });

    it('should reject codes with special characters', () => {
      expect(validateCPTCode('12-345')).toBe(false);
      expect(validateCPTCode('12.345')).toBe(false);
      expect(validateCPTCode('12_345')).toBe(false);
      expect(validateCPTCode('12#45')).toBe(false);
    });

    it('should reject codes with spaces in between', () => {
      expect(validateCPTCode('12 345')).toBe(false);
      expect(validateCPTCode('1 2345')).toBe(false);
    });
  });
});

describe('validateICD10Batch', () => {
  it('should separate valid and invalid codes', () => {
    const codes = ['A12', 'INVALID', 'B34.2', '123', 'C45.12'];
    const result = validateICD10Batch(codes);
    
    expect(result.valid).toEqual(['A12', 'B34.2', 'C45.12']);
    expect(result.invalid).toEqual(['INVALID', '123']);
  });

  it('should handle all valid codes', () => {
    const codes = ['A12', 'B34.2', 'C45.12', 'D56.ABC'];
    const result = validateICD10Batch(codes);
    
    expect(result.valid).toEqual(codes);
    expect(result.invalid).toEqual([]);
  });

  it('should handle all invalid codes', () => {
    const codes = ['INVALID', '123', 'A1', 'AB'];
    const result = validateICD10Batch(codes);
    
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual(codes);
  });

  it('should handle empty array', () => {
    const result = validateICD10Batch([]);
    
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([]);
  });

  it('should preserve original code strings', () => {
    const codes = ['  A12  ', 'a12.1'];
    const result = validateICD10Batch(codes);
    
    expect(result.valid).toEqual(['  A12  ', 'a12.1']);
    expect(result.invalid).toEqual([]);
  });

  it('should handle codes with edge cases', () => {
    const codes = [
      'A12',           // valid
      '',              // invalid
      'Z99.9999',      // valid
      'A12.',          // invalid
      'A12.12345',     // invalid
      'E78.123'        // valid
    ];
    const result = validateICD10Batch(codes);
    
    expect(result.valid).toEqual(['A12', 'Z99.9999', 'E78.123']);
    expect(result.invalid).toEqual(['', 'A12.', 'A12.12345']);
  });
});

describe('validateCPTBatch', () => {
  it('should separate valid and invalid codes', () => {
    const codes = ['99213', '1234', '12345', 'ABCDE', '67890'];
    const result = validateCPTBatch(codes);
    
    expect(result.valid).toEqual(['99213', '12345', '67890']);
    expect(result.invalid).toEqual(['1234', 'ABCDE']);
  });

  it('should handle all valid codes', () => {
    const codes = ['99213', '12345', '67890', '00000'];
    const result = validateCPTBatch(codes);
    
    expect(result.valid).toEqual(codes);
    expect(result.invalid).toEqual([]);
  });

  it('should handle all invalid codes', () => {
    const codes = ['1234', 'ABCDE', '123456', 'A2345'];
    const result = validateCPTBatch(codes);
    
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual(codes);
  });

  it('should handle empty array', () => {
    const result = validateCPTBatch([]);
    
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([]);
  });

  it('should preserve original code strings', () => {
    const codes = ['  99213  ', '12345'];
    const result = validateCPTBatch(codes);
    
    expect(result.valid).toEqual(['  99213  ', '12345']);
    expect(result.invalid).toEqual([]);
  });

  it('should handle codes with edge cases', () => {
    const codes = [
      '99213',         // valid
      '',              // invalid
      '00000',         // valid
      '12.345',        // invalid
      '123456',        // invalid
      '99999'          // valid
    ];
    const result = validateCPTBatch(codes);
    
    expect(result.valid).toEqual(['99213', '00000', '99999']);
    expect(result.invalid).toEqual(['', '12.345', '123456']);
  });
});
