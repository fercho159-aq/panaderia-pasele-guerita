import React from 'react';
import { addToCart } from '../stores/cartStore';

interface Props {
    recipeId: string;
    recipeName: string;
    recipePrice: number;
    recipeImage: string;
}

export const RecipeBuyButton: React.FC<Props> = ({ recipeId, recipeName, recipePrice, recipeImage }) => {
    const handleBuy = () => {
        addToCart({
            id: recipeId,
            name: recipeName,
            price: recipePrice,
            image: recipeImage,
            category: 'cookie' as const, // reuse existing type
            isRecipe: true,
        });
        window.location.href = '/checkout';
    };

    return (
        <button
            onClick={handleBuy}
            className="w-full h-14 font-serif text-xl bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white hover:text-primary transition-all rounded-xl font-bold"
        >
            Comprar Receta ${recipePrice.toFixed(2)}
        </button>
    );
};
