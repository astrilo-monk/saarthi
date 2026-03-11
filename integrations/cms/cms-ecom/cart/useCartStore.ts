import { create } from 'zustand';

/** Local storage key for cart persistence */
const CART_STORAGE_KEY = 'cart-items';

/** Cart item representing a product in the cart */
export interface CartItem {
  /** Line item ID */
  id: string;
  /** CMS collection ID */
  collectionId: string;
  /** CMS item ID (product ID) */
  itemId: string;
  /** Product name for display */
  name: string;
  /** Item price */
  price: number;
  /** Quantity in cart */
  quantity: number;
  /** Product image URL */
  image?: string;
}

/** Input for adding items to cart */
export interface AddToCartInput {
  collectionId: string;
  itemId: string;
  quantity?: number;
}

interface CartState {
  // State
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  addingItemId: string | null;
  isCheckingOut: boolean;
  error: string | null;

  // Internal
  _initialized: boolean;
}

interface CartActions {
  // Public actions
  addToCart: (input: AddToCartInput) => Promise<void>;
  removeFromCart: (item: CartItem) => void;
  updateQuantity: (item: CartItem, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Internal
  _fetchCart: () => Promise<void>;
  _sendQuantityUpdate: (lineItemId: string, quantity: number) => Promise<void>;
}

type CartStore = CartState & { actions: CartActions };

/** Save cart items to localStorage */
const saveCartToStorage = (items: CartItem[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    // Ignore storage errors
  }
};

/** Load cart items from localStorage */
const loadCartFromStorage = (): CartItem[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return [];
};

/**
 * Zustand store for cart state and actions.
 * Uses localStorage for persistence.
 */
export const useCartStore = create<CartStore>((set, get) => ({
  // Initial state
  items: [],
  isOpen: false,
  isLoading: false,
  addingItemId: null,
  isCheckingOut: false,
  error: null,
  _initialized: false,

  actions: {
    /** Load cart from localStorage */
    _fetchCart: async () => {
      if (get()._initialized) return;

      set({ isLoading: true, error: null });
      const items = loadCartFromStorage();
      set({
        items,
        isLoading: false,
        _initialized: true,
      });
    },

    /** Add item to cart */
    addToCart: async (input: AddToCartInput) => {
      set({ addingItemId: input.itemId, error: null });

      try {
        const { items } = get();
        const existingItem = items.find(
          i => i.itemId === input.itemId && i.collectionId === input.collectionId
        );

        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map(i =>
            i.id === existingItem.id
              ? { ...i, quantity: i.quantity + (input.quantity || 1) }
              : i
          );
        } else {
          const newItem: CartItem = {
            id: crypto.randomUUID(),
            collectionId: input.collectionId,
            itemId: input.itemId,
            name: 'Item',
            price: 0,
            quantity: input.quantity || 1,
          };
          newItems = [...items, newItem];
        }

        set({ items: newItems });
        saveCartToStorage(newItems);
      } catch (error: unknown) {
        console.error('Add to cart failed:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to add to cart' });
      } finally {
        set({ addingItemId: null });
      }
    },

    /** Remove item from cart */
    removeFromCart: (item: CartItem) => {
      const newItems = get().items.filter(i => i.id !== item.id);
      set({ items: newItems });
      saveCartToStorage(newItems);
    },

    /** Internal: persist quantity update */
    _sendQuantityUpdate: async (_lineItemId: string, _quantity: number) => {
      // No-op: cart is persisted via localStorage in updateQuantity
    },

    /** Update quantity */
    updateQuantity: (item: CartItem, quantity: number) => {
      const { items } = get();

      let newItems: CartItem[];
      if (quantity <= 0) {
        newItems = items.filter(i => i.id !== item.id);
      } else {
        newItems = items.map(i => i.id === item.id ? { ...i, quantity } : i);
      }

      set({ items: newItems });
      saveCartToStorage(newItems);
    },

    /** Clear all items from cart */
    clearCart: () => {
      set({ items: [] });
      saveCartToStorage([]);
    },

    /** Checkout - demo mode */
    checkout: async () => {
      set({ isCheckingOut: true, error: null });
      alert('Checkout is not available in demo mode.');
      set({ isCheckingOut: false });
    },

    /** Toggle cart drawer */
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

    /** Open cart drawer */
    openCart: () => set({ isOpen: true }),

    /** Close cart drawer */
    closeCart: () => set({ isOpen: false }),
  },
}));

/**
 * Hook to access cart state and actions.
 * No provider needed - works anywhere in the app.
 */
export const useCart = () => {
  const store = useCartStore();

  // Auto-fetch cart on first use
  if (!store._initialized && !store.isLoading) {
    store.actions._fetchCart();
  }

  // Computed values
  const itemCount = store.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = store.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    // State
    items: store.items,
    itemCount,
    totalPrice,
    isOpen: store.isOpen,
    isLoading: store.isLoading,
    addingItemId: store.addingItemId,
    isCheckingOut: store.isCheckingOut,
    error: store.error,
    // Actions
    actions: store.actions,
  };
};
