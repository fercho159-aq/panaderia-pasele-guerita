import { persistentAtom } from '@nanostores/persistent';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    category: 'cookie' | 'bread';
    flavor?: string;
    boxSize?: number; // 3, 6, 9
    boxLabel?: string; // e.g. "Caja Mediana (6)"
    selections?: Record<string, number>; // flavor -> quantity within the box
    isRecipe?: boolean; // digital product — skip location/date/customize steps
    isSugarFree?: boolean; // sugar-free box — only SF flavors allowed
};

export type CartStore = {
    items: Record<string, CartItem>;
    gift: { is_gift: boolean; message: string };
    isOpen: boolean;
    /** Per-flavor stock limits (max units per order). Keyed by flavor id. NOT persisted. */
    stockLimits: Record<string, number>;
};

const initialState: CartStore = {
    items: {},
    gift: { is_gift: false, message: '' },
    isOpen: false,
    stockLimits: {},
};

// Persistent store with JSON encoding.
// Note: `isOpen` and `stockLimits` are intentionally NOT persisted.
//   - `isOpen`: drawer should always start closed on a fresh page load,
//     otherwise users can get stuck if the drawer was open when they
//     last navigated away.
//   - `stockLimits`: server-managed, must always be re-fetched fresh
//     so admin changes propagate immediately.
export const cartStore = persistentAtom<CartStore>('cart', initialState, {
    encode: (value) => JSON.stringify({ ...value, isOpen: false, stockLimits: {} }),
    decode: (raw) => {
        try {
            const parsed = JSON.parse(raw);
            return { ...initialState, ...parsed, isOpen: false, stockLimits: {} };
        } catch {
            return initialState;
        }
    },
});

/** Replace all stock limits. Call after fetching /api/storefront-data on each page. */
export const setStockLimits = (limits: Record<string, number>) => {
    const state = cartStore.get();
    cartStore.set({ ...state, stockLimits: limits });
};

/** Notify any listening UI that an addToCart/updateQuantity was blocked by stock. */
const notifyStockBlocked = (flavor: string, max: number) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart:stock-limit', { detail: { flavor, max } }));
    }
};

export const toggleCart = () => {
    const state = cartStore.get();
    cartStore.set({ ...state, isOpen: !state.isOpen });
};

export const addToCart = (product: any, flavor?: string) => {
    const state = cartStore.get();
    const itemId = product.boxSize ? `box-${product.boxSize}-${Date.now()}` : (flavor ? `${product.id}-${flavor}` : product.id);

    // Stock-limit check for non-box items. Boxes manage their own selections
    // via handleBoxSelection (which already enforces limits).
    if (!product.boxSize && product.id && state.stockLimits[product.id] !== undefined) {
        const limit = state.stockLimits[product.id];
        const currentQty = state.items[itemId]?.quantity || 0;
        if (currentQty >= limit) {
            notifyStockBlocked(product.name, limit);
            return;
        }
    }

    const newItems = { ...state.items };
    if (newItems[itemId] && !product.boxSize) { // Don't stack boxes automatically, let them be unique if needed
        newItems[itemId] = { ...newItems[itemId], quantity: newItems[itemId].quantity + 1 };
    } else {
        newItems[itemId] = {
            ...product,
            id: itemId, // Important: Sync the ID for handleBoxSelection
            quantity: 1,
            flavor: flavor || '',
            selections: product.boxSize ? (flavor ? { [flavor]: 1 } : {}) : undefined
        };
    }

    const isCheckoutPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/checkout');

    cartStore.set({
        ...state,
        items: newItems,
        isOpen: !isCheckoutPage // Don't open if already in checkout flow
    });
};

export const removeFromCart = (itemId: string) => {
    const state = cartStore.get();
    const newItems = { ...state.items };
    delete newItems[itemId];
    cartStore.set({ ...state, items: newItems });
};

export const updateQuantity = (itemId: string, quantity: number) => {
    const state = cartStore.get();
    if (quantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    const existing = state.items[itemId];
    if (existing && !existing.boxSize) {
        const limit = state.stockLimits[existing.id];
        if (limit !== undefined && quantity > limit) {
            notifyStockBlocked(existing.name, limit);
            return;
        }
    }
    const newItems = { ...state.items };
    newItems[itemId] = { ...newItems[itemId], quantity };
    cartStore.set({ ...state, items: newItems });
};

export const setGiftMessage = (is_gift: boolean, message: string) => {
    const state = cartStore.get();
    cartStore.set({ ...state, gift: { is_gift, message } });
};
