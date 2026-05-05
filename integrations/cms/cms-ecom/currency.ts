/**
 * Default currency code.
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * Formats a numeric amount as a currency string.
 * Uses the browser's locale for proper formatting (symbol placement, decimals).
 */
export function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch {
    console.warn(`Invalid currency code: ${currencyCode}, falling back to ${DEFAULT_CURRENCY}`);
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
    }).format(amount);
  }
}

/**
 * Hook to access site currency for price formatting.
 * Returns USD as the default currency.
 */
export const useCurrency = () => {
  return {
    currency: DEFAULT_CURRENCY,
    isLoading: false,
    error: null,
  };
};
