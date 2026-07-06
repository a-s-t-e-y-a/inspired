/**
 * Validation utilities for form inputs
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Basic phone number validation (accepts various formats)
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

/**
 * Validate contact form data
 */
export function validateContactForm(data: {
  fullName?: string;
  country?: string;
  email?: string;
  phone?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate full name
  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.push({
      field: 'fullName',
      message: 'Patient full name is required',
    });
  } else if (data.fullName.trim().length < 2) {
    errors.push({
      field: 'fullName',
      message: 'Patient name must be at least 2 characters',
    });
  }

  // Validate country
  if (!data.country || data.country.trim().length === 0) {
    errors.push({
      field: 'country',
      message: 'Please select a country',
    });
  }

  // Validate email
  if (!data.email || data.email.trim().length === 0) {
    errors.push({
      field: 'email',
      message: 'Email is required',
    });
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
    });
  }

  // Validate phone
  if (!data.phone || data.phone.trim().length === 0) {
    errors.push({
      field: 'phone',
      message: 'Phone number is required',
    });
  } else if (!PHONE_REGEX.test(data.phone.replace(/\s/g, ''))) {
    errors.push({
      field: 'phone',
      message: 'Please enter a valid phone number',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate medical request form data
 */
export function validateMedicalForm(data: {
  fullName?: string;
  country?: string;
  email?: string;
  phone?: string;
  medicalCondition?: string;
}): ValidationResult {
  const contactErrors = validateContactForm(data);

  const additionalErrors: ValidationError[] = [];

  // Validate medical condition
  if (!data.medicalCondition || data.medicalCondition.trim().length === 0) {
    additionalErrors.push({
      field: 'medicalCondition',
      message: 'Please describe your medical condition',
    });
  } else if (data.medicalCondition.trim().length < 10) {
    additionalErrors.push({
      field: 'medicalCondition',
      message: 'Please provide at least 10 characters for medical condition',
    });
  }

  return {
    isValid: contactErrors.isValid && additionalErrors.length === 0,
    errors: [...contactErrors.errors, ...additionalErrors],
  };
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!query || query.trim().length === 0) {
    errors.push({
      field: 'query',
      message: 'Search query is required',
    });
  } else if (query.trim().length < 2) {
    errors.push({
      field: 'query',
      message: 'Search query must be at least 2 characters',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(
  errors: ValidationError[],
  fieldName: string
): string | null {
  const error = errors.find((e) => e.field === fieldName);
  return error ? error.message : null;
}
