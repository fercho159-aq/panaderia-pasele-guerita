import React, { useState } from 'react';
import { addToCart } from '../stores/cartStore';
import { Button, Badge } from '@pasele-guerita/ui';

interface ProductDetailProps {
    product: any;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
    const [selectedFlavor, setSelectedFlavor] = useState(product.category === 'cookie' ? 'Chocolate Lovers' : '');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Mock additional gallery images if they don't exist
    const images = [
        product.image,
        product.category === 'cookie' ? '/imagenes/IMG_6654.webp' : '/imagenes/IMG_6753.webp',
        product.category === 'cookie' ? '/imagenes/IMG_6662.webp' : '/imagenes/IMG_6755.webp',
    ].filter(Boolean);

    const price = product.price || (product.category === 'cookie' ? 12 : 10);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
                {/* Visuals - Left Column */}
                <div className="space-y-6">
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white shadow-xl border border-primary/5 group">
                        <img 
                            src={images[currentImageIndex]} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        
                        {/* Exclusive Design Badge */}
                        <div className="absolute top-8 right-8 w-24 h-24 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
                                <path id="curve" fill="transparent" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                                <text className="text-[10px] uppercase font-black fill-primary tracking-widest">
                                    <textPath xlinkHref="#curve">Exclusive Design • Artisanal Baking • </textPath>
                                </text>
                            </svg>
                            <span className="absolute text-primary font-serif text-xs font-bold italic">Pásele</span>
                        </div>

                        {/* Arrows */}
                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                className="w-12 h-12 rounded-full bg-primary/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-colors"
                            >
                                ←
                            </button>
                            <button 
                                onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                className="w-12 h-12 rounded-full bg-primary/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-colors"
                            >
                                →
                            </button>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-4">
                        {images.map((img, i) => (
                            <button 
                                key={i}
                                onClick={() => setCurrentImageIndex(i)}
                                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === i ? 'border-primary scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details - Right Column */}
                <div className="py-4">
                    <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6">{product.name}</h1>
                    
                    <div className="prose prose-lg text-gray-700 font-serif italic mb-8 leading-relaxed">
                        <p>{product.description || "Deléitate con lo mejor de nuestra panadería artesanal. Hecho fresco cada día con ingredientes de la más alta calidad."}</p>
                        <p className="not-italic font-sans text-base text-gray-500 mt-4">
                            Sumerge tus sentidos en la profundidad del sabor de nuestra masa madre fermentada lentamente por más de 24 horas.
                        </p>
                    </div>

                    {/* Options */}
                    {product.category === 'cookie' && (
                        <div className="mb-10">
                            <label className="block text-xs font-black uppercase tracking-[0.2em] text-primary/40 mb-4">Flavor</label>
                            <div className="relative">
                                <select 
                                    value={selectedFlavor}
                                    onChange={(e) => setSelectedFlavor(e.target.value)}
                                    className="w-full p-5 rounded-2xl border-2 border-primary/10 bg-white text-primary font-serif italic text-xl appearance-none focus:border-primary outline-none transition-all cursor-pointer"
                                >
                                    <option>Chocolate Lovers - ${price}</option>
                                    <option>Classic Favorites - ${price}</option>
                                    <option>Baker's Choice - ${price}</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40">
                                    ▼
                                </div>
                            </div>
                        </div>
                    )}

                    <Button 
                        variant="primary" 
                        className="w-full h-16 text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mb-12"
                        onClick={() => addToCart({ ...product, price }, selectedFlavor)}
                    >
                        ADD TO BAG — ${price.toFixed(2)}
                    </Button>

                    {/* Specs / Accordin style (simplified for now) */}
                    <div className="divide-y divide-primary/10 border-t border-primary/10">
                        <details className="group py-6" open>
                            <summary className="flex justify-between items-center cursor-pointer list-none font-sans font-bold uppercase tracking-widest text-sm text-primary">
                                Description
                                <span className="transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <div className="mt-4 text-gray-600 leading-relaxed font-sans font-medium">
                                {product.description}
                                {product.ingredients && (
                                    <p className="mt-4 pt-4 border-t border-primary/5 text-xs text-primary/60 italic">
                                        {product.ingredients}
                                    </p>
                                )}
                            </div>
                        </details>
                        <details className="group py-6">
                            <summary className="flex justify-between items-center cursor-pointer list-none font-sans font-bold uppercase tracking-widest text-sm text-primary">
                                Allergens
                                <span className="transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <div className="mt-4 text-gray-600 text-sm">
                                Contiene trigo y lácteos. Procesado en instalaciones que también manejan nueces y almendras.
                            </div>
                        </details>
                        <details className="group py-6">
                            <summary className="flex justify-between items-center cursor-pointer list-none font-sans font-bold uppercase tracking-widest text-sm text-primary">
                                Care & Storage
                                <span className="transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <div className="mt-4 text-gray-600 text-sm italic font-serif">
                                Mantener en un lugar fresco y seco. Recomendamos calentar ligeramente antes de consumir para recuperar la textura del horno.
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
};
