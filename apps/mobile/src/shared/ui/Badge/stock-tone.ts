import { LOW_STOCK_THRESHOLD } from '../../constants/ui';
import type { BadgeTone } from './Badge';

/** 0 → out, ≤ LOW_STOCK_THRESHOLD → low, else stock. */
export const stockTone = (qtyAvailable: number): BadgeTone =>
  qtyAvailable <= 0 ? 'out' : qtyAvailable <= LOW_STOCK_THRESHOLD ? 'low' : 'stock';
