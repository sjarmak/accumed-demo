/**
 * Medical code validators for ICD-10 and CPT codes
 */

/**
 * Validates ICD-10 diagnosis code format
 * ICD-10 codes are 3-7 characters: letter followed by 2 digits, then optional dot and up to 4 more characters
 */
export function validateICD10Code(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // ICD-10 format: Letter + 2 digits + optional (dot + 1-4 alphanumeric)
  const icd10Pattern = /^[A-Z]\d{2}(\.\w{1,4})?$/;
  return icd10Pattern.test(code.trim().toUpperCase());
}

/**
 * Validates CPT (Current Procedural Terminology) code format
 * CPT codes are 5-digit numeric codes
 */
export function validateCPTCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // CPT format: exactly 5 digits
  const cptPattern = /^\d{5}$/;
  return cptPattern.test(code.trim());
}

/**
 * Validates a batch of ICD-10 codes
 */
export function validateICD10Batch(codes: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  codes.forEach(code => {
    if (validateICD10Code(code)) {
      valid.push(code);
    } else {
      invalid.push(code);
    }
  });

  return { valid, invalid };
}

/**
 * Validates a batch of CPT codes
 */
export function validateCPTBatch(codes: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  codes.forEach(code => {
    if (validateCPTCode(code)) {
      valid.push(code);
    } else {
      invalid.push(code);
    }
  });

  return { valid, invalid };
}
