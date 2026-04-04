// Safe date formatting utilities for mock data compatibility

import { format, formatDistanceToNow } from 'date-fns';

export function safeFormatDate(dateValue: any, formatStr: string = 'dd MMM yyyy'): string {
  if (!dateValue) return '-';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    return format(date, formatStr);
  } catch {
    return '-';
  }
}

export function safeFormatDateTime(dateValue: any): string {
  return safeFormatDate(dateValue, 'dd MMM yyyy, HH:mm');
}

export function safeFormatDistanceToNow(dateValue: any): string {
  if (!dateValue) return 'recently';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'recently';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export function getDateValue(obj: any, ...keys: string[]): any {
  for (const key of keys) {
    if (obj[key]) return obj[key];
  }
  return null;
}
