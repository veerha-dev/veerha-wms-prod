/**
 * GST split helper.
 *
 * Per Indian GST law:
 *   - Same state (intra-state) → split 50/50 into CGST + SGST.
 *   - Different state (inter-state) → entire tax goes to IGST.
 *
 * Per PDF workflow §3.6:
 *   "Client in same state as your warehouse — apply CGST 9% and SGST 9%
 *    Client in different state — apply IGST 18%
 *    System should auto-detect based on client's state from their address."
 */

export type GstType = 'intra-state' | 'inter-state';

/**
 * Decide the GST type for an invoice based on warehouse state vs party (customer/supplier) state.
 * Comparison is case-insensitive and ignores surrounding whitespace.
 * If either state is missing, defaults to 'intra-state' (safe default; admin can override).
 */
export function decideGstType(
  warehouseState: string | null | undefined,
  partyState: string | null | undefined,
): GstType {
  if (!warehouseState || !partyState) return 'intra-state';
  const a = warehouseState.trim().toLowerCase();
  const b = partyState.trim().toLowerCase();
  if (!a || !b) return 'intra-state';
  return a === b ? 'intra-state' : 'inter-state';
}

export interface GstSplit {
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  lineTotal: number;
}

/**
 * Calculate the GST split for a single line.
 * Returns rounded-to-paise amounts.
 */
export function calculateGstForLine(params: {
  taxableAmount: number;
  gstRate: number;
  gstType: GstType;
}): GstSplit {
  const { taxableAmount, gstRate, gstType } = params;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstType === 'inter-state') {
    igst = taxableAmount * (gstRate / 100);
  } else {
    cgst = taxableAmount * (gstRate / 2 / 100);
    sgst = taxableAmount * (gstRate / 2 / 100);
  }

  const taxAmount = cgst + sgst + igst;
  return {
    cgstAmount: round2(cgst),
    sgstAmount: round2(sgst),
    igstAmount: round2(igst),
    taxAmount: round2(taxAmount),
    lineTotal: round2(taxableAmount + taxAmount),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
