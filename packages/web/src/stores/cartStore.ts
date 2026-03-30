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
    selections?: Record<string, number>; // flavor -> quantity within the box
};

export type CartStore = {
    items: Record<string, CartItem>;
    gift: { is_gift: boolean; message: string };
    isOpen: boolean;
};

const initialState: CartStore = {
    items: {},
    gift: { is_gift: false, message: '' },
    isOpen: false,
};

// Persistent store with JSON encoding
export const cartStore = persistentAtom<CartStore>('cart', initialState, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export const toggleCart = () => {
    const state = cartStore.get();
    cartStore.set({ ...state, isOpen: !state.isOpen });
};

export const addToCart = (product: any, flavor?: string) => {
    const state = cartStore.get();
    const itemId = product.boxSize ? `box-${product.boxSize}-${Date.now()}` : (flavor ? `${product.id}-${flavor}` : product.id);
    
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
    const newItems = { ...state.items };
    newItems[itemId] = { ...newItems[itemId], quantity };
    cartStore.set({ ...state, items: newItems });
};

export const setGiftMessage = (is_gift: boolean, message: string) => {
    const state = cartStore.get();
    cartStore.set({ ...state, gift: { is_gift, message } });
};
