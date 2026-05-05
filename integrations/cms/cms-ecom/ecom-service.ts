/**
 * Buy now - demo mode stub.
 * In production, this would create a checkout and redirect to payment.
 */
export async function buyNow(
  items: Array<{ collectionId: string; itemId: string; quantity?: number }>
): Promise<void> {
  if (items.length === 0) {
    throw new Error('At least one item is required for checkout');
  }

  alert('Checkout is not available in demo mode.');
}
