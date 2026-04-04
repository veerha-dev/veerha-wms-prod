import { ValidatorFn } from './types';

export const required: ValidatorFn = (value) => {
  if (!value || value.trim() === '') {
    return 'This field is required';
  }
  return null;
};

export const isNumber: ValidatorFn = (value) => {
  if (!value || value.trim() === '') return null;
  if (isNaN(Number(value))) {
    return 'Must be a valid number';
  }
  return null;
};

export const isPositiveNumber: ValidatorFn = (value) => {
  if (!value || value.trim() === '') return null;
  const num = Number(value);
  if (isNaN(num)) {
    return 'Must be a valid number';
  }
  if (num < 0) {
    return 'Must be a positive number';
  }
  return null;
};

export const isInteger: ValidatorFn = (value) => {
  if (!value || value.trim() === '') return null;
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num)) {
    return 'Must be a whole number';
  }
  return null;
};

export const isPositiveInteger: ValidatorFn = (value) => {
  if (!value || value.trim() === '') return null;
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num)) {
    return 'Must be a whole number';
  }
  if (num < 0) {
    return 'Must be a positive number';
  }
  return null;
};

export const isBoolean: ValidatorFn = (value) => {
  if (!value || value.trim() === '') return null;
  const lower = value.toLowerCase().trim();
  if (!['true', 'false', '1', '0', 'yes', 'no'].includes(lower)) {
    return 'Must be true/false, yes/no, or 1/0';
  }
  return null;
};

export const isDate: ValidatorFn = (value) => {
  if (!value || value.trim() === '') return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return 'Must be a valid date (YYYY-MM-DD)';
  }
  return null;
};

export const isEmail: ValidatorFn = (value) => {
  if (!value || value.trim() === '') return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Must be a valid email address';
  }
  return null;
};

export const maxLength = (max: number): ValidatorFn => (value) => {
  if (!value || value.trim() === '') return null;
  if (value.length > max) {
    return `Must be ${max} characters or less`;
  }
  return null;
};

export const minLength = (min: number): ValidatorFn => (value) => {
  if (!value || value.trim() === '') return null;
  if (value.length < min) {
    return `Must be at least ${min} characters`;
  }
  return null;
};

export const inRange = (min: number, max: number): ValidatorFn => (value) => {
  if (!value || value.trim() === '') return null;
  const num = Number(value);
  if (isNaN(num)) {
    return 'Must be a valid number';
  }
  if (num < min || num > max) {
    return `Must be between ${min} and ${max}`;
  }
  return null;
};

export const oneOf = (options: string[], caseSensitive = false): ValidatorFn => (value) => {
  if (!value || value.trim() === '') return null;
  const compareValue = caseSensitive ? value.trim() : value.trim().toLowerCase();
  const compareOptions = caseSensitive ? options : options.map(o => o.toLowerCase());
  if (!compareOptions.includes(compareValue)) {
    return `Must be one of: ${options.join(', ')}`;
  }
  return null;
};

export const pattern = (regex: RegExp, message: string): ValidatorFn => (value) => {
  if (!value || value.trim() === '') return null;
  if (!regex.test(value)) {
    return message;
  }
  return null;
};

export const compose = (...validators: ValidatorFn[]): ValidatorFn => (value, row) => {
  for (const validator of validators) {
    const error = validator(value, row);
    if (error) return error;
  }
  return null;
};
