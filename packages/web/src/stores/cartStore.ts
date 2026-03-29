import { map } from 'nanostores';

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

export const cartStore = map<CartStore>({
    items: {},
    gift: { is_gift: false, message: '' },
    isOpen: false,
});

export const toggleCart = () => {
    cartStore.setKey('isOpen', !cartStore.get().isOpen);
};

export const addToCart = (product: any, flavor?: string) => {
    const { items } = cartStore.get();
    const itemId = flavor ? `${product.id}-${flavor}` : product.id;
    
    if (items[itemId]) {
        cartStore.setKey('items', {
            ...items,
            [itemId]: { ...items[itemId], quantity: items[itemId].quantity + 1 }
        });
    } else {
        cartStore.setKey('items', {
            ...items,
            [itemId]: { 
                ...product, 
                quantity: 1, 
                flavor: flavor || '' 
            }
        });
    }
    cartStore.setKey('isOpen', true);
};

export const removeFromCart = (itemId: string) => {
    const { items } = cartStore.get();
    const newItems = { ...items };
    delete newItems[itemId];
    cartStore.setKey('items', newItems);
};

export const updateQuantity = (itemId: string, quantity: number) => {
    const { items } = cartStore.get();
    if (quantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    cartStore.setKey('items', {
        ...items,
        [itemId]: { ...items[itemId], quantity }
    });
};

export const setGiftMessage = (is_gift: boolean, message: string) => {
    cartStore.setKey('gift', { is_gift, message });
};
