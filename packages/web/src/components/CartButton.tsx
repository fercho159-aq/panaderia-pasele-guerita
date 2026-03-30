import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartStore, toggleCart } from '../stores/cartStore';

export const CartButton: React.FC = () => {
    const { items } = useStore(cartStore);
    const itemCount = Object.values(items).reduce((acc, item) => acc + item.quantity, 0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (itemCount > 0) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [itemCount]);

    return (
        <button 
            onClick={toggleCart}
            className={`relative flex items-center gap-2 text-primary hover:text-accent transition-colors group ${isAnimating ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}`}
            style={{ transitionDuration: '300ms' }}
            aria-label="Open Cart"
        >
            <span className="hidden md:inline font-sans font-bold uppercase tracking-widest text-sm">Carrito</span>
            <div className="relative">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-current" strokeWidth="2">
                    <path d="M4 6h16l-1.5 13H5.5L4 6z" />
                    <circle cx="12" cy="6" r="3" />
                </svg>
                {itemCount > 0 && (
                    <span className={`absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${isAnimating ? 'animate-ping' : ''}`}>
                        {itemCount}
                    </span>
                )}
            </div>
        </button>
    );
};
