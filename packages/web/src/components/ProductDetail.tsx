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
            // Start with empty selections — user picks flavors in Step 3
            addToCart({ 
                ...product, 
                price: selectedPlan.price,
                boxSize: selectedPlan.count,
                name: `Caja de ${selectedPlan.count}`
            }, '');
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
                    <h1 className="font-serif text-5xl md:text-7xl text-primary mb-6 font-bold tracking-tight">{product.name}</h1>
                    
                    <div className="prose prose-lg text-gray-700 font-serif italic mb-10 leading-relaxed border-l-4 border-accent/30 pl-6">
                        <p className="font-medium text-xl leading-relaxed">{product.description || "Deléitate con lo mejor de nuestra panadería artesanal. Hecho fresco cada día con ingredientes de la más alta calidad y un proceso de fermentación lenta que garantiza un sabor inigualable."}</p>
                    </div>

                    {/* Options: Plan Selection for Cookies */}
                    {isCookie ? (
                        <div className="mb-12">
                            <label className="block text-[11px] font-black uppercase tracking-[0.25em] text-primary/60 mb-6">Selecciona tu Plan de Galletas</label>
                            <div className="grid grid-cols-1 gap-4">
                                {cookiePlans.map((plan) => (
                                    <button 
                                        key={plan.count}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex justify-between items-center ${selectedPlan.count === plan.count ? 'border-primary bg-primary/5 shadow-inner' : 'border-bg hover:border-primary/20 bg-white'}`}
                                    >
                                        <div className="text-left">
                                            <span className="font-serif text-2xl text-primary italic font-bold">{plan.label}</span>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mt-1">Receta original de la Güerita</p>
                                        </div>
                                        <span className="font-black text-primary text-3xl">${plan.price.toFixed(2)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-12">
                            <div className="flex justify-between items-center p-8 bg-white rounded-[2rem] border-2 border-primary/10 shadow-sm">
                                <div>
                                    <span className="font-serif text-2xl text-primary italic font-bold">Hogaza Individual</span>
                                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mt-1">Fermentación natural +48h</p>
                                </div>
                                <span className="font-black text-primary text-3xl">${displayPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <Button 
                        variant="primary" 
                        className="w-full h-20 text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mb-16 rounded-[2.5rem] bg-primary text-bg hover:shadow-primary/20 font-black tracking-widest"
                        onClick={handleAddToBag}
                    >
                        AGREGAR A LA BOLSA — ${displayPrice.toFixed(2)}
                    </Button>

                    {/* Accordion Sections */}
                    <div className="divide-y divide-primary/10 border-t border-primary/10 mb-10">
                        {[
                            { id: 'Description', label: 'Descripción', icon: '✨' },
                            { id: 'Allergens', label: 'Alérgenos', icon: '🛡️' },
                            { id: 'Care', label: 'Cuidados y Conservación', icon: '🏠' }
                        ].map((section) => (
                            <details key={section.id} className="group py-8" open={section.id === 'Description'}>
                                <summary className="flex justify-between items-center cursor-pointer list-none font-sans font-black uppercase tracking-[0.2em] text-[11px] text-primary">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl opacity-80">{section.icon}</span>
                                        {section.label}
                                    </div>
                                    <span className="transition-transform group-open:rotate-180 opacity-40 text-lg">↓</span>
                                </summary>
                                <div className="mt-6 text-gray-600 leading-relaxed font-sans text-base max-w-xl">
                                    {section.id === 'Description' && (
                                        <div className="space-y-4">
                                            <p className="font-medium">{product.description}</p>
                                            {product.ingredients && (
                                                <div className="pt-6 mt-6 border-t border-primary/5">
                                                    <p className="text-[10px] uppercase tracking-widest font-black text-primary/40 mb-2">Ingredientes Protagónicos</p>
                                                    <p className="italic font-serif opacity-80">{product.ingredients}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {section.id === 'Allergens' && (
                                        <div className="bg-bg/40 p-6 rounded-2xl border border-primary/5">
                                            <p className="font-bold text-primary mb-2">Información importante para tu salud:</p>
                                            <p>Contiene gluten (trigo) y derivados lácteos. Nuestros productos son elaborados en una cocina artesanal que también procesa nueces, cacahuates, almendras y semillas. Si tienes alguna alergia severa, por favor contáctanos vía WhatsApp antes de realizar tu pedido.</p>
                                        </div>
                                    )}
                                    {section.id === 'Care' && (
                                        <table className="w-full text-sm">
                                            <tbody>
                                                <tr>
                                                    <td className="font-bold py-3 border-b border-primary/5 text-primary">Temp. Ambiente</td>
                                                    <td className="py-3 border-b border-primary/5 italic opacity-80 text-right">3 días en recipiente hermético.</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-3 border-b border-primary/5 text-primary">Refrigeración</td>
                                                    <td className="py-3 border-b border-primary/5 italic opacity-80 text-right">7 días. Calentar antes de consumir.</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-3 text-primary">Congelación</td>
                                                    <td className="py-3 italic opacity-80 text-right">Hasta 1 mes. Cortar en rebanadas antes.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
