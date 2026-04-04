import { TransformerFn } from './types';

export const toString: TransformerFn = (value) => {
  return value?.trim() || '';
};

export const toNumber: TransformerFn = (value) => {
  if (!value || value.trim() === '') return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

export const toInteger: TransformerFn = (value) => {
  if (!value || value.trim() === '') return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
};

export const toFloat: TransformerFn = (value) => {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

export const toBoolean: TransformerFn = (value) => {
  if (!value || value.trim() === '') return false;
  const lower = value.toLowerCase().trim();
  return ['true', '1', 'yes', 'y'].includes(lower);
};

export const toDate: TransformerFn = (value) => {
  if (!value || value.trim() === '') return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

export const toDateOnly: TransformerFn = (value) => {
  if (!value || value.trim() === '') return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

export const toLowerCase: TransformerFn = (value) => {
  return value?.toLowerCase().trim() || '';
};

export const toUpperCase: TransformerFn = (value) => {
  return value?.toUpperCase().trim() || '';
};

export const toTitleCase: TransformerFn = (value) => {
  if (!value) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const toArray: TransformerFn = (value) => {
  if (!value || value.trim() === '') return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

export const toJson: TransformerFn = (value) => {
  if (!value || value.trim() === '') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const trimWhitespace: TransformerFn = (value) => {
  return value?.trim() || '';
};

export const nullIfEmpty: TransformerFn = (value) => {
  if (!value || value.trim() === '') return null;
  return value.trim();
};

export const defaultValue = (defaultVal: unknown): TransformerFn => (value) => {
  if (!value || value.trim() === '') return defaultVal;
  return value.trim();
};

export const mapValue = (mapping: Record<string, unknown>): TransformerFn => (value) => {
  if (!value || value.trim() === '') return null;
  const key = value.trim().toLowerCase();
  for (const [mapKey, mapValue] of Object.entries(mapping)) {
    if (mapKey.toLowerCase() === key) {
      return mapValue;
    }
  }
  return value.trim();
};
