import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { cartStore, toggleCart, updateQuantity, removeFromCart, setGiftMessage, setStockLimits } from '../stores/cartStore';
import { Button } from '@pasele-guerita/ui';

export const CartDrawer: React.FC = () => {
    const { items, isOpen, gift } = useStore(cartStore);
    const [isClosing, setIsClosing] = useState(false);
    const [stockLimitMsg, setStockLimitMsg] = useState<{ flavor: string; max: number } | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // Always restore on unmount so we never leave the page locked
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    // Global listener for stock-limit blocks. Mounted in CartDrawer because
    // it's the only React island present on every page.
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ flavor: string; max: number }>).detail;
            if (detail?.flavor) setStockLimitMsg(detail);
        };
        window.addEventListener('cart:stock-limit', handler);
        return () => window.removeEventListener('cart:stock-limit', handler);
    }, []);

    // Fetch fresh stock limits on every page load. CartDrawer is mounted
    // globally, so this guarantees addToCart/updateQuantity always have the
    // current admin-configured limits — no matter which page the customer
    // lands on first.
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
        return () => { cancelled = true; };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            toggleCart();
            setIsClosing(false);
        }, 300);
    };

    // Stock-limit modal renders independently so it works even when the drawer is closed.
    const stockLimitModal = stockLimitMsg ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center animate-fade-in border border-primary/10">
                <h3 className="font-serif text-2xl text-primary italic font-bold mb-3">Límite alcanzado</h3>
                <p className="text-primary/70 font-serif mb-2">
                    Solo quedan <span className="font-black text-primary">{stockLimitMsg.max}</span> unidades disponibles de <span className="font-black text-accent italic">{stockLimitMsg.flavor}</span> en este pedido.
                </p>
                <p className="text-xs text-primary/40 font-sans uppercase tracking-widest mb-8">Producción limitada por el horno</p>
                <button
                    onClick={() => setStockLimitMsg(null)}
                    className="w-full h-14 bg-primary text-bg font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg"
                >
                    Entendido
                </button>
            </div>
        </div>
    ) : null;

    if (!isOpen && !isClosing) return stockLimitModal;

    const cartItemsList = Object.entries(items);
    const subtotal = cartItemsList.reduce((acc, [_, item]) => acc + item.price * item.quantity, 0);

    return (
        <>
        {stockLimitModal}
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />
            
            {/* Drawer */}
            <div className={`absolute right-0 top-0 h-full w-full sm:max-w-sm md:max-w-md bg-[#FDF5E6] shadow-2xl flex flex-col transition-transform duration-300 transform ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}>
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-primary" strokeWidth="2.5">
                                <path d="M4 6h16l-1.5 13H5.5L4 6z" />
                                <circle cx="12" cy="6" r="3" />
                                <text x="12" y="7" textAnchor="middle" fontSize="7" fontWeight="900" fill="currentColor" stroke="none" className="text-primary">{cartItemsList.length}</text>
                            </svg>
                        </div>
                        <h2 className="font-serif text-3xl text-primary font-bold">Tu Orden</h2>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cartItemsList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <span className="text-7xl mb-6"></span>
                            <p className="font-serif text-xl text-primary italic font-medium">Bolsa vacía...<br/>¿Huele a galletas?</p>
                        </div>
                    ) : (
                        cartItemsList.map(([id, item]) => (
                            <div key={id} className="flex gap-3 group animate-fade-in bg-white rounded-2xl p-3 border border-primary/5 shadow-sm">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                                    <img
                                        src={item.image || '/imagenes/IMG_6657.webp'}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => (e.currentTarget.src = '/imagenes/IMG_6657.webp')}
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-serif text-base text-primary leading-tight font-bold italic truncate">{
                                        item.boxSize && item.selections && Object.keys(item.selections).length > 0
                                            ? (Object.keys(item.selections).length === 1 ? Object.keys(item.selections)[0] : 'Sabores Mixtos')
                                            : item.name
                                    }</h3>
                                            {item.boxLabel && (
                                                <p className="text-[10px] font-sans text-primary/60 font-bold uppercase tracking-widest mt-0.5">{item.boxLabel}</p>
                                            )}
                                            {item.selections && Object.keys(item.selections).length > 0 ? (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {Object.entries(item.selections).map(([flavor, count]) => (
                                                        <p key={flavor} className="text-[9px] font-sans text-accent font-black uppercase tracking-wider bg-accent/5 px-1.5 py-0.5 rounded-full">
                                                            {count}x {flavor}
                                                        </p>
                                                    ))}
                                                </div>
                                            ) : !item.boxLabel && (
                                                <p className="text-[10px] font-sans text-primary/50 font-bold uppercase tracking-widest mt-0.5">{item.category === 'bread' ? 'Hogaza' : 'Unidad'}</p>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(id)}
                                            className="text-primary/20 hover:text-red-500 transition-colors p-1"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-3 bg-bg rounded-full border border-primary/10 px-2 py-0.5 shadow-sm">
                                            <button 
                                                onClick={() => updateQuantity(id, item.quantity - 1)}
                                                className="text-primary font-black px-1.5 hover:scale-125 transition-transform"
                                            >-</button>
                                            <span className="font-sans font-bold text-primary min-w-[15px] text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(id, item.quantity + 1)}
                                                className="text-primary font-black px-1.5 hover:scale-125 transition-transform"
                                            >+</button>
                                        </div>
                                        <span className="font-sans font-black text-primary text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-4 bg-white shadow-[0_-20px_50px_rgba(45,90,78,0.1)] border-t border-primary/5 space-y-4">
                    {/* Gift Section */}
                    <div className="bg-accent/5 border border-accent/10 rounded-2xl p-4 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xl"></span>
                                <h3 className="font-serif text-lg text-primary font-bold italic">¿Es un regalo?</h3>
                            </div>
                            <button 
                                onClick={() => setGiftMessage(!gift.is_gift, gift.message)}
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${gift.is_gift ? 'text-accent' : 'text-primary'}`}
                            >
                                {gift.is_gift ? 'QUITAR MENSAJE' : 'AÑADIR MENSAJE ESPECIAL (+)'}
                            </button>
                            {gift.is_gift && (
                                <textarea 
                                    className="w-full mt-4 bg-white/50 border-b-2 border-accent/20 focus:border-accent outline-none text-primary font-serif italic py-3 px-4 rounded-xl resize-none shadow-inner"
                                    placeholder="Tu mensaje aquí..."
                                    rows={2}
                                    value={gift.message}
                                    onChange={(e) => setGiftMessage(true, e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 pt-1">
                        <div className="flex justify-between font-serif text-2xl text-primary items-end">
                            <span className="italic font-medium">Subtotal</span>
                            <span className="font-sans font-black text-primary">${subtotal.toFixed(2)}</span>
                        </div>
                        <Button
                            variant="primary"
                            className="w-full h-14 text-base shadow-2xl flex items-center justify-center gap-3 rounded-2xl font-black tracking-widest"
                            disabled={cartItemsList.length === 0}
                            onClick={() => {
                                if (window.location.pathname.startsWith('/checkout')) {
                                    handleClose();
                                } else {
                                    window.location.href = '/checkout';
                                }
                            }}
                        >
                            {window.location.pathname.startsWith('/checkout') ? 'CONTINUAR' : 'PEDIR AHORA'}
                        </Button>
                        <p className="text-center text-[9px] uppercase font-black text-primary/30 tracking-[0.2em] px-4">
                            Entregas los Sábados en Dallas y alrededores. Revisa disponibilidad en el próximo paso.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};
