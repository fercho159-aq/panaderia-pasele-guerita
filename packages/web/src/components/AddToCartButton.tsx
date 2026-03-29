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
                // Default flavor for quick add
                const flavor = product.category === 'cookie' ? 'Chocolate Lovers' : '';
                addToCart(product, flavor);
            }}
            className={`block w-full text-center text-sm font-bold text-primary hover:text-accent transition-colors duration-200 py-3 ${className}`}
        >
            Agregar al pedido →
        </button>
    );
};
