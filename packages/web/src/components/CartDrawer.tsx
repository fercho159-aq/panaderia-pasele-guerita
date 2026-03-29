import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { cartStore, toggleCart, updateQuantity, removeFromCart, setGiftMessage } from '../stores/cartStore';
import { Button } from '@pasele-guerita/ui';

export const CartDrawer: React.FC = () => {
    const { items, isOpen, gift } = useStore(cartStore);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            toggleCart();
            setIsClosing(false);
        }, 300);
    };

    if (!isOpen && !isClosing) return null;

    const cartItemsList = Object.entries(items);
    const subtotal = cartItemsList.reduce((acc, [_, item]) => acc + item.price * item.quantity, 0);

    return (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />
            
            {/* Drawer */}
            <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#FDF5E6] shadow-2xl flex flex-col transition-transform duration-300 transform ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}>
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-[#000080]/10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-[#000080]" strokeWidth="2">
                                <path d="M4 6h16l-1.5 13H5.5L4 6z" />
                                <circle cx="12" cy="6" r="3" />
                                <text x="12" y="7" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#000080" stroke="none">{cartItemsList.length}</text>
                            </svg>
                        </div>
                        <h2 className="font-serif text-3xl text-[#000080]">Your Bag</h2>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full border border-[#000080]/20 flex items-center justify-center text-[#000080] hover:bg-[#000080]/5 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cartItemsList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <span className="text-6xl mb-4">🍪</span>
                            <p className="font-serif text-xl text-[#000080]/60 italic">Your bag is empty...</p>
                        </div>
                    ) : (
                        cartItemsList.map(([id, item]) => (
                            <div key={id} className="flex gap-4 group">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/50 border border-[#000080]/5">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-serif text-lg text-[#000080] leading-tight">{item.name}</h3>
                                            <p className="text-sm font-sans text-[#000080]/60 italic mt-1">{item.flavor || 'Regular'}</p>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(id)}
                                            className="text-[#000080]/40 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex items-center gap-4 bg-white rounded-full border border-[#000080]/10 px-3 py-1 scale-90 -ml-2">
                                            <button 
                                                onClick={() => updateQuantity(id, item.quantity - 1)}
                                                className="text-[#000080] font-bold px-1"
                                            >-</button>
                                            <span className="font-sans font-bold text-[#000080] min-w-[20px] text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(id, item.quantity + 1)}
                                                className="text-[#000080] font-bold px-1"
                                            >+</button>
                                        </div>
                                        <span className="font-sans font-bold text-[#000080]">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-[#000080]/5 space-y-6">
                    {/* Gift Section */}
                    <div className="bg-[#B0E0E6]/30 border border-[#000080]/10 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-[#000080]" strokeWidth="1.5">
                                        <path d="M4 8h16v13H4V8zM12 8c1-3 4-3 4-3s-1 4-4 4-4-4-4-4 3 0 4 3z" />
                                        <path d="M12 21V8" />
                                        <path d="M12 11c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z" fill="#000080" className="opacity-0 group-hover:opacity-20 transition-opacity" />
                                    </svg>
                                </div>
                                <h3 className="font-serif text-2xl text-[#000080]">Make It Personal</h3>
                            </div>
                            <button 
                                onClick={() => setGiftMessage(!gift.is_gift, gift.message)}
                                className="flex items-center gap-2 text-[#000080] text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                                {gift.is_gift ? 'Edit Gift Message' : 'ADD A GIFT MESSAGE (+)'}
                            </button>
                            {gift.is_gift && (
                                <textarea 
                                    className="w-full mt-4 bg-transparent border-b border-[#000080]/20 focus:border-[#000080] outline-none text-[#000080] font-serif italic py-2"
                                    placeholder="Your sweet message here..."
                                    value={gift.message}
                                    onChange={(e) => setGiftMessage(true, e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between font-serif text-2xl text-[#000080]">
                            <span className="italic">Subtotal</span>
                            <span className="font-sans font-bold">${subtotal.toFixed(2)}</span>
                        </div>
                        <Button 
                            className="w-full h-16 text-xl shadow-xl flex items-center justify-center gap-2"
                            disabled={cartItemsList.length === 0}
                            onClick={() => {
                                if (window.location.pathname.startsWith('/checkout')) {
                                    handleClose();
                                } else {
                                    window.location.href = '/checkout';
                                }
                            }}
                        >
                            {window.location.pathname.startsWith('/checkout') ? 'CONTINUE CHECKOUT' : 'CHECK OUT'}
                        </Button>
                        <p className="text-center text-[10px] uppercase font-bold text-[#000080]/40 tracking-widest">
                            Select delivery date and calculate shipping at Checkout.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
