export type ValidationResult = {
  valid: boolean;
  message?: string;
};

export function required(value: unknown, message = "This field is required"): ValidationResult {
  if (typeof value === "string") return { valid: value.trim().length > 0, message };
  return { valid: value !== undefined && value !== null, message };
}

export function email(value: string, message = "Enter a valid email address"): ValidationResult {
  return { valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message };
}

export function minLength(value: string, length: number, message = `Enter at least ${length} characters`): ValidationResult {
  return { valid: value.trim().length >= length, message };
}

export function maxLength(value: string, length: number, message = `Use ${length} characters or fewer`): ValidationResult {
  return { valid: value.length <= length, message };
}

export function positiveNumber(value: number, message = "Enter a number greater than zero"): ValidationResult {
  return { valid: Number.isFinite(value) && value > 0, message };
}
