import React, { useState, useEffect } from 'react';
import { addToCart, setStockLimits } from '../stores/cartStore';
import { Button } from '@pasele-guerita/ui';
import { allProducts } from '@pasele-guerita/core';
import { useTranslations, DEFAULT_LANG, localizedPath, type Language } from '../i18n/translations';

interface ProductDetailProps {
    product: any;
    lang?: Language;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, lang = DEFAULT_LANG }) => {
    const t = useTranslations(lang);
    const isSugarFree = !!(product as any).is_sugar_free;
    // Plans for cookies — different prices for Sugar Free
    const planLabels = isSugarFree ? t('productDetail.cookiePlans.sugarFree') : t('productDetail.cookiePlans.regular');
    const cookiePlans = isSugarFree ? [
        { count: 3, price: 13.50, label: planLabels.small },
        { count: 6, price: 27.00, label: planLabels.medium },
        { count: 9, price: 40.50, label: planLabels.large }
    ] : [
        { count: 3, price: 12.00, label: planLabels.small },
        { count: 6, price: 24.00, label: planLabels.medium },
        { count: 9, price: 31.50, label: planLabels.large }
    ];

    const [selectedPlan, setSelectedPlan] = useState(cookiePlans[0]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [stockLimitMsg, setStockLimitMsg] = useState<{ flavor: string; max: number } | null>(null);
    const [wantSliced, setWantSliced] = useState(false);
    const noSlice = !!(product as any).no_slice;

    // Fetch fresh stock limits from the server so addToCart can enforce them.
    // Also listen for the global stock-limit event to show feedback.
    useEffect(() => {
        let cancelled = false;
        fetch('/api/storefront-data')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (cancelled || !data) return;
                const all = [...(data.cookies || []), ...(data.breads || [])];
                const stockById: Record<string, number> = {};
                all.forEach((f: any) => {
                    if (f.stock && f.stock > 0 && f.id) stockById[f.id] = f.stock;
                });
                setStockLimits(stockById);
            })
            .catch(() => { /* fail silent */ });

        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ flavor: string; max: number }>).detail;
            if (detail?.flavor) setStockLimitMsg(detail);
        };
        window.addEventListener('cart:stock-limit', handler);
        return () => {
            cancelled = true;
            window.removeEventListener('cart:stock-limit', handler);
        };
    }, []);

    const images = [
        product.image,
        product.category === 'cookie' ? '/imagenes/IMG_6654.webp' : '/imagenes/IMG_6753.webp',
        product.category === 'cookie' ? '/imagenes/IMG_6662.webp' : '/imagenes/IMG_6755.webp',
    ].filter(Boolean);

    const isCookie = product.category === 'cookie';
    const basePrice = isCookie ? selectedPlan.price : (product.price || 18.00);
    const sliceUpcharge = (!isCookie && !noSlice && wantSliced) ? 1 : 0;
    const displayPrice = basePrice + sliceUpcharge;

    // Related products: same category, excluding current
    const relatedCategory = isCookie ? 'cookie' : 'bread';
    const relatedProducts = allProducts.filter(
        p => p.category === relatedCategory && p.id !== product.id
    ).slice(0, 4);

    const handleAddToBag = () => {
        if (isCookie) {
            addToCart({
                ...product,
                price: selectedPlan.price,
                boxSize: selectedPlan.count,
                boxLabel: selectedPlan.label,
                isSugarFree: !!(product as any).is_sugar_free,
            }, '');
        } else {
            // Breads: include slicing info in name/price so it propagates
            // through cart drawer, checkout review, and admin notes.
            const sliced = !noSlice && wantSliced;
            addToCart({
                ...product,
                price: basePrice + (sliced ? 1 : 0),
                name: sliced ? `${product.name} ${t('productDetail.slicedTag')}` : product.name,
                category: 'bread'
            });
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
                        <p className="font-medium text-xl leading-relaxed">{product.description || t('productDetail.defaultDescription')}</p>
                    </div>

                    {/* Options: Plan Selection for Cookies */}
                    {isCookie ? (
                        <div className="mb-12">
                            {/* Promo text — moved ABOVE the plan picker and emphasized so users notice it */}
                            <div className="mb-8 p-5 rounded-2xl bg-accent/10 border-l-4 border-accent">
                                <p
                                    className="font-serif text-lg sm:text-xl text-primary italic leading-snug"
                                    dangerouslySetInnerHTML={{ __html: t('productDetail.promoCustomize') }}
                                />
                            </div>

                            <label className="block text-[11px] font-black uppercase tracking-[0.25em] text-primary/60 mb-6">{t('productDetail.selectPlan')}</label>
                            <div className="grid grid-cols-1 gap-4">
                                {cookiePlans.map((plan) => (
                                    <button
                                        key={plan.count}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex justify-between items-center ${selectedPlan.count === plan.count ? 'border-primary bg-primary/5 shadow-inner' : 'border-bg hover:border-primary/20 bg-white'}`}
                                    >
                                        <div className="text-left">
                                            <span className="font-serif text-2xl text-primary italic font-bold">{plan.label}</span>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mt-1">{t('productDetail.originalRecipe')}</p>
                                        </div>
                                        <span className="font-black text-primary text-3xl">${plan.price.toFixed(2)}</span>
                                     </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-12 space-y-4">
                            <div className="flex justify-between items-center p-8 bg-white rounded-[2rem] border-2 border-primary/10 shadow-sm">
                                <div>
                                    <span className="font-serif text-2xl text-primary italic font-bold">{t('productDetail.loafSize')}</span>
                                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mt-1">{t('productDetail.naturalFermentation')}</p>
                                </div>
                                <span className="font-black text-primary text-3xl">${basePrice.toFixed(2)}</span>
                            </div>

                            {/* Slice option — hidden for products marked no_slice (e.g. Panqué) */}
                            {!noSlice && (
                                <label className="flex items-center justify-between gap-4 p-5 rounded-2xl border-2 border-primary/10 bg-white hover:border-primary/30 cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={wantSliced}
                                            onChange={(e) => setWantSliced(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-primary/30 text-primary accent-primary"
                                        />
                                        <div>
                                            <span className="font-serif text-base text-primary italic font-bold">{t('productDetail.wantSliced')}</span>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mt-0.5">{t('productDetail.wantSlicedSubtitle')}</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-accent text-lg whitespace-nowrap">+$1.00</span>
                                </label>
                            )}
                        </div>
                    )}

                    <Button
                        variant="primary"
                        className="w-full h-20 text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mb-16 rounded-[2.5rem] bg-primary text-bg hover:shadow-primary/20 font-black tracking-widest"
                        onClick={handleAddToBag}
                    >
                        {t('productDetail.addToBag')}{!isCookie && !noSlice && wantSliced ? ` ${t('productDetail.slicedTag')}` : ''} — ${displayPrice.toFixed(2)}
                    </Button>

                    {/* Accordion Sections */}
                    <div className="divide-y divide-primary/10 border-t border-primary/10 mb-4">
                        {[
                            { id: 'Description', label: t('productDetail.sections.description') },
                            { id: 'Allergens', label: t('productDetail.sections.allergens') },
                            { id: 'Care', label: t('productDetail.sections.care') }
                        ].map((section) => (
                            <details key={section.id} className="group py-6" open={section.id === 'Description'}>
                                <summary className="flex justify-between items-center cursor-pointer list-none font-sans font-black uppercase tracking-[0.15em] text-sm text-primary">
                                    {section.label}
                                    <span className="transition-transform group-open:rotate-180 text-primary/50 text-lg">↓</span>
                                </summary>
                                <div className="mt-6 text-gray-600 leading-relaxed font-sans text-base max-w-xl">
                                    {section.id === 'Description' && (
                                        <div className="space-y-4">
                                            <p className="font-medium">{product.description}</p>
                                            {product.ingredients && (
                                                <div className="pt-6 mt-6 border-t border-primary/5">
                                                    <p className="text-[10px] uppercase tracking-widest font-black text-primary/40 mb-2">{t('productDetail.ingredientsLabel')}</p>
                                                    <p className="italic font-serif opacity-80">{product.ingredients}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {section.id === 'Allergens' && (
                                        <div className="bg-bg/40 p-6 rounded-2xl border border-primary/5">
                                            <p className="font-bold text-primary mb-2">{t('productDetail.allergens.title')}</p>
                                            <p>{t('productDetail.allergens.body')}</p>
                                        </div>
                                    )}
                                    {section.id === 'Care' && (
                                        <table className="w-full text-sm">
                                            <tbody>
                                                <tr>
                                                    <td className="font-bold py-3 border-b border-primary/5 text-primary">{t('productDetail.care.ambient')}</td>
                                                    <td className="py-3 border-b border-primary/5 italic opacity-80 text-right">{t('productDetail.care.ambientValue')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-3 border-b border-primary/5 text-primary">{t('productDetail.care.refrigerated')}</td>
                                                    <td className="py-3 border-b border-primary/5 italic opacity-80 text-right">{t('productDetail.care.refrigeratedValue')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold py-3 text-primary">{t('productDetail.care.frozen')}</td>
                                                    <td className="py-3 italic opacity-80 text-right">{isCookie ? t('productDetail.care.frozenCookie') : t('productDetail.care.frozenBread')}</td>
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

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-8 pt-8 border-t border-primary/10">
                    <h2 className="font-serif text-3xl text-primary mb-8">
                        {isCookie ? t('productDetail.related.cookies') : t('productDetail.related.breads')}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map(p => (
                            <a key={p.id} href={localizedPath(lang, `/product/${p.id}`)} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-bg/20 flex flex-col">
                                <div className="h-40 overflow-hidden bg-gray-50">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-serif text-lg text-primary italic mb-1">{p.name}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 flex-1">{p.description}</p>
                                    <span className="text-sm font-bold text-primary mt-3 group-hover:text-accent transition-colors">{t('productDetail.related.viewProduct')}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Stock Limit Modal */}
            {stockLimitMsg && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center animate-fade-in border border-primary/10">
                        <h3 className="font-serif text-2xl text-primary italic font-bold mb-3">{t('productDetail.stockLimit.title')}</h3>
                        <p className="text-primary/70 font-serif mb-2">
                            {t('productDetail.stockLimit.messageBefore')} <span className="font-black text-primary">{stockLimitMsg.max}</span> {t('productDetail.stockLimit.messageMiddle')} <span className="font-black text-accent italic">{stockLimitMsg.flavor}</span> {t('productDetail.stockLimit.messageAfter')}
                        </p>
                        <p className="text-xs text-primary/40 font-sans uppercase tracking-widest mb-8">{t('productDetail.stockLimit.subtitle')}</p>
                        <button
                            onClick={() => setStockLimitMsg(null)}
                            className="w-full h-14 bg-primary text-bg font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg"
                        >
                            {t('productDetail.stockLimit.ok')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
