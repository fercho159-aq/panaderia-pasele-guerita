import { persistentAtom } from '@nanostores/persistent';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    category: 'cookie' | 'bread';
    flavor?: string;
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
    const itemId = flavor ? `${product.id}-${flavor}` : product.id;
    
    const newItems = { ...state.items };
    if (newItems[itemId]) {
        newItems[itemId] = { ...newItems[itemId], quantity: newItems[itemId].quantity + 1 };
    } else {
        newItems[itemId] = { 
            ...product, 
            quantity: 1, 
            flavor: flavor || '' 
        };
    }

    cartStore.set({
        ...state,
        items: newItems,
        isOpen: true
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
