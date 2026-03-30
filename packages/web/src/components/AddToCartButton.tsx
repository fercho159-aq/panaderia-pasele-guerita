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
            className={`block w-full text-center text-sm font-bold text-primary hover:text-accent transition-colors duration-200 py-3 ${className}`}
        >
            Agregar al pedido →
        </button>
    );
};
