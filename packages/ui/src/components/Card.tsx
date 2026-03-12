import React from 'react';

interface CardProps {
    title: string;
    description?: string;
    image?: string;
    price?: number;
    children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, description, image, price, children }) => {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-bg">
            {image && <img src={image} alt={title} className="w-full h-48 object-cover" />}
            <div className="p-6">
                <h3 className="font-serif font-bold text-3xl text-primary mb-2">{title}</h3>
                {description && <p className="text-gray-600 mb-4">{description}</p>}
                {price && <p className="text-primary font-bold text-xl mb-4">${price.toFixed(2)}</p>}
                {children}
            </div>
        </div>
    );
};
