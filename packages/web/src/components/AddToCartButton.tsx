import React from 'react';
import { addToCart } from '../stores/cartStore';

interface AddToCartButtonProps {
    product: any;
    className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, className }) => {
    return (
        <button 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Always start with empty selections so user picks flavors in Step 3
                addToCart(product, '');
            }}
            className={`block w-full text-center text-sm font-bold bg-primary text-white hover:bg-accent hover:scale-[1.02] active:scale-95 transition-all duration-200 py-3 px-6 rounded-xl shadow-sm hover:shadow-md ${className}`}
        >
            Agregar al pedido →
        </button>
    );
};
