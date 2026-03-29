import React, { useState } from 'react';
import { addToCart } from '../stores/cartStore';
import { Button } from '@pasele-guerita/ui';

interface ProductDetailProps {
    product: any;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
    // Plans for cookies
    const cookiePlans = [
        { count: 3, price: 12.00, label: 'Standard Box (3)' },
        { count: 6, price: 22.00, label: 'Family Box (6)' },
        { count: 9, price: 31.50, label: 'Party Box (9)' }
    ];

    const [selectedPlan, setSelectedPlan] = useState(cookiePlans[0]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Mock additional gallery images if they don't exist
    const images = [
        product.image,
        product.category === 'cookie' ? '/imagenes/IMG_6654.webp' : '/imagenes/IMG_6753.webp',
        product.category === 'cookie' ? '/imagenes/IMG_6662.webp' : '/imagenes/IMG_6755.webp',
    ].filter(Boolean);

    const isCookie = product.category === 'cookie';
    const displayPrice = isCookie ? selectedPlan.price : (product.price || 18.00);

    const handleAddToBag = () => {
        if (isCookie) {
            // Logic: Add a box of X cookies starting with this flavor
            addToCart({ 
                ...product, 
                price: selectedPlan.price,
                boxSize: selectedPlan.count,
                name: `Caja de ${selectedPlan.count} (${product.name})`
            }, product.name);
        } else {
            addToCart({ ...product, price: displayPrice });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                {/* Visuals - Left Column */}
                <div className="space-y-8">
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white shadow-2xl border border-primary/5 group">
                        <img 
                            src={images[currentImageIndex]} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                        
                        {/* Rotating Badge */}
                        <div className="absolute top-10 right-10 w-28 h-28 flex items-center justify-center pointer-events-none">
                            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
                                <path id="curve" fill="transparent" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                                <text className="text-[11px] uppercase font-black fill-accent/80 tracking-widest">
                                    <textPath xlinkHref="#curve">Exclusive Design • Artisanal Baking • </textPath>
                                </text>
                            </svg>
                            <span className="absolute text-accent font-serif text-sm font-bold italic">Pásele</span>
                        </div>

                        {/* Arrows */}
                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-primary flex items-center justify-center hover:bg-white transition-colors shadow-lg">←</button>
                            <button onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-primary flex items-center justify-center hover:bg-white transition-colors shadow-lg">→</button>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-4">
                        {images.map((img, i) => (
                            <button key={i} onClick={() => setCurrentImageIndex(i)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${currentImageIndex === i ? 'border-primary scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                <img src={img} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details - Right Column */}
                <div className="py-4">
                    <h1 className="font-serif text-5xl md:text-7xl text-primary mb-6">{product.name}</h1>
                    
                    <div className="prose prose-lg text-gray-700 font-serif italic mb-10 leading-relaxed border-l-4 border-accent/20 pl-6">
                        <p>{product.description || "Deléitate con lo mejor de nuestra panadería artesanal. Hecho fresco cada día con ingredientes de la más alta calidad."}</p>
                    </div>

                    {/* Options: Plan Selection for Cookies */}
                    {isCookie ? (
                        <div className="mb-12">
                            <label className="block text-xs font-black uppercase tracking-[0.2em] text-primary/40 mb-6">Selecciona tu Plan de Galletas</label>
                            <div className="grid grid-cols-1 gap-4">
                                {cookiePlans.map((plan) => (
                                    <button 
                                        key={plan.count}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`p-6 rounded-2xl border-2 transition-all flex justify-between items-center ${selectedPlan.count === plan.count ? 'border-primary bg-primary/5 shadow-inner' : 'border-bg hover:border-primary/10 bg-white'}`}
                                    >
                                        <div className="text-left">
                                            <span className="font-serif text-xl text-primary italic">{plan.label}</span>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Galletas horneadas hoy</p>
                                        </div>
                                        <span className="font-bold text-primary text-2xl">${plan.price.toFixed(2)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-12">
                            <div className="flex justify-between items-center p-6 bg-white rounded-2xl border-2 border-primary/5 shadow-sm">
                                <span className="font-serif text-xl text-primary italic">Hogaza Individual</span>
                                <span className="font-bold text-primary text-2xl">${displayPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <Button 
                        variant="primary" 
                        className="w-full h-20 text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mb-12 rounded-3xl bg-primary text-bg hover:shadow-primary/20"
                        onClick={handleAddToBag}
                    >
                        AGREGAR A LA BOLSA — ${displayPrice.toFixed(2)}
                    </Button>

                    {/* Accordion Sections */}
                    <div className="divide-y divide-primary/10 border-t border-primary/10">
                        {['Description', 'Allergens', 'Care & Storage'].map((section) => (
                            <details key={section} className="group py-6" open={section === 'Description'}>
                                <summary className="flex justify-between items-center cursor-pointer list-none font-sans font-bold uppercase tracking-widest text-xs text-primary/60">
                                    {section}
                                    <span className="transition-transform group-open:rotate-180">↓</span>
                                </summary>
                                <div className="mt-4 text-gray-600 leading-relaxed font-sans text-sm">
                                    {section === 'Description' && (
                                        <>
                                            {product.description}
                                            {product.ingredients && <p className="mt-4 pt-4 border-t border-primary/5 italic opacity-60 text-xs">{product.ingredients}</p>}
                                        </>
                                    )}
                                    {section === 'Allergens' && "Contiene trigo y lácteos. Procesado en instalaciones que también manejan nueces y almendras."}
                                    {section === 'Care & Storage' && "Mantener en un lugar fresco y seco. Recomendamos calentar ligeramente antes de consumir para recuperar la textura del horno."}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
