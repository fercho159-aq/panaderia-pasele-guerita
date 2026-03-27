import React, { useState, useEffect } from 'react';
import { 
    createOrder, 
    PickupLocation,
    isValidHoustonZip,
    getEarliestAvailableDate,
    cookieFlavors,
    breadFlavors,
    pickupLocations,
    isWednesdayOrSaturday
} from '@pasele-guerita/core';
import { Button } from '@pasele-guerita/ui';

export const CheckoutFlow: React.FC = () => {
    // Data states
    const [liveCookies, setLiveCookies] = useState<any[]>([]);
    const [liveBreads, setLiveBreads] = useState<any[]>([]);
    const [liveLocations, setLiveLocations] = useState<PickupLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [menuTab, setMenuTab] = useState<'cookies' | 'breads'>('cookies');

    // Flow states
    const [step, setStep] = useState(1);
    const [logistics, setLogistics] = useState<'pickup' | 'delivery' | null>(null);
    const [zipCode, setZipCode] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [boxSize, setBoxSize] = useState<number | null>(null);
    const [cart, setCart] = useState<Record<string, number>>({});
    const [locationId, setLocationId] = useState('');
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
    const [gift, setGift] = useState({ is_gift: false, message: '' });
    const [remarks, setRemarks] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | null>(null);
    const [slicedBreads, setSlicedBreads] = useState<Record<string, number>>({});
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const earliestDate = getEarliestAvailableDate();

    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch('/api/storefront-data');
                if (!response.ok) throw new Error('Failed to fetch from /api/storefront-data');
                const data = await response.json();

                setLiveCookies(data.cookies?.length > 0 
                    ? data.cookies.map((c: any) => {
                        const s = cookieFlavors.find((sf: any) => sf.id === c.id) || {};
                        return { ...s, ...c, image: c.image || (s as any).image, description: c.description ?? (s as any).description, ingredients: c.ingredients ?? (s as any).ingredients };
                    }) 
                    : cookieFlavors);
                setLiveBreads(data.breads?.length > 0 ? data.breads : breadFlavors);
                setLiveLocations(data.locations?.length > 0 ? data.locations : pickupLocations);
            } catch (error) {
                console.error("Failed to load DB data, using fallbacks:", error);
                setLiveCookies(cookieFlavors);
                setLiveBreads(breadFlavors);
                setLiveLocations(pickupLocations);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Date Logic helpers
    const isDateValid = isWednesdayOrSaturday(selectedDate);
    const selectedDayName = selectedDate ? new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long' }) : '';

    const doesDateMatchLocation = (dateStr: string, locId: string) => {
        const loc = liveLocations.find(l => l.id === locId);
        if (!loc || !dateStr) return true;
        // Capitalize first letter to match locations.ts (e.g. "Wednesday")
        const day = new Date(dateStr.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long' });
        const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
        return (loc.days as string[]).includes(capitalizedDay);
    };

    const isStep2Valid = selectedDate && (locationId === 'special-coordination' || (isDateValid && doesDateMatchLocation(selectedDate, locationId)));

    // All products combined for summary/order purposes
    const allLiveProducts = [...liveCookies, ...liveBreads];

    const totalCookies = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = allLiveProducts.find((p: any) => p.id === id);
        if (item?.category === 'cookie') {
            return sum + (qty as number) * (item.id === 'sugar-free-3pack' ? 3 : 1);
        }
        return sum;
    }, 0);

    const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = allLiveProducts.find((p: any) => p.id === id);
        if (!item) return sum;
        let itemTotal = 0;
        if (item.category === 'bread') {
            itemTotal = (item.price * (qty as number));
            // Add $1 per sliced loaf
            if (slicedBreads[id]) {
                itemTotal += slicedBreads[id] * 1;
            }
            return sum + itemTotal;
        }
        if (item.id === 'sugar-free-platano') return sum + (13.50 * (qty as number));
        
        // Tiered regular cookie pricing
        const cookiePrice = boxSize === 9 ? 3.5 : 4;
        return sum + (cookiePrice * (qty as number));
    }, 0);

    const handleAddCookie = (id: string) => {
        const isBread = liveBreads.some((b: any) => b.id === id);
        if (isBread || (boxSize && totalCookies < boxSize)) {
            setCart({ ...cart, [id]: (cart[id] || 0) + 1 });
        }
    };

    const handleRemoveCookie = (id: string) => {
        if (cart[id] > 0) {
            const newCart = { ...cart, [id]: cart[id] - 1 };
            if (newCart[id] === 0) delete newCart[id];
            setCart(newCart);
        }
    };

    if (isLoading) {
        return <div className="text-center py-20 animate-pulse text-primary font-serif italic text-2xl">Calentando los hornos...</div>;
    }

    const steps = ["Logística", "Calendario", "Menú", "Detalles", "Pago"];

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl mt-12 border border-bg min-h-[600px] flex flex-col">
            {/* Stepper Header */}
            <div className="flex justify-between mb-12">
                {steps.map((label, i) => (
                    <div key={label} className="flex-1 mx-1 flex flex-col items-center">
                        <div className={`h-2 w-full rounded-full mb-2 ${step >= i + 1 ? 'bg-primary' : 'bg-bg'}`} />
                        <span className={`text-[8px] uppercase font-bold tracking-widest ${step === i + 1 ? 'text-primary' : 'text-gray-300'}`}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Logística */}
            {step === 1 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-5xl md:text-6xl text-primary mb-2 italic">1. Punto de Entrega</h2>
                    <p className="text-xl text-primary/70 mb-8 font-serif">Elige dónde recogerás tu pedido. <span className="text-accent italic">Solo entregamos Miércoles y Sábados.</span></p>

                    {liveLocations.length === 0 ? (
                        <p className="text-gray-400 italic text-center py-10">Cargando ubicaciones de Dallas...</p>
                    ) : (
                        <div className="space-y-6 mb-10 max-h-[420px] overflow-y-auto pr-1">
                            {(['pickup', 'delivery'] as const).map(type => {
                                const group = liveLocations.filter(l => l.type === type && !l.isSoldOut);
                                if (group.length === 0) return null;
                                const labels: Record<string, string> = { pickup: '📦 Puntos de Pickup (Recogida)', delivery: '🚚 Puntos de Entrega (Sábado)' };
                                return (
                                    <div key={type}>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-primary mb-3 border-b border-bg pb-1">{labels[type]}</p>
                                        <div className="grid gap-4">
                                            {group.map(l => (
                                                <button
                                                    key={l.id}
                                                    onClick={() => { setLocationId(l.id); setLogistics(type === 'delivery' ? 'delivery' : 'pickup'); }}
                                                    className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${locationId === l.id ? 'border-primary bg-primary/5' : 'border-bg hover:border-accent'}`}
                                                >
                                                    <div className="relative z-10">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-serif text-xl text-primary italic font-bold">{l.name}</h4>
                                                            {l.id === 'special-coordination' && <span className="bg-accent/20 text-primary text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Especial</span>}
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-2 leading-tight">{l.address}</p>
                                                        <div className="flex gap-4">
                                                            <p className="text-[10px] font-bold text-primary flex items-center gap-1">
                                                                <span className="opacity-50">📅</span> {l.days.join(' & ')}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                <span className="opacity-50">⏰</span> {l.hours}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-auto">
                        <Button
                            disabled={!locationId}
                            onClick={() => setStep(2)}
                            className="w-full h-16 text-xl"
                        >
                            Siguiente: Seleccionar Fecha
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Calendario */}
            {step === 2 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-4xl text-primary mb-2 italic">2. Horarios</h2>
                    <p className="text-gray-600 mb-10 font-serif">Entregamos los <strong>Miércoles y Sábados</strong>. Requerimos 48h de preparación.</p>

                    <div className="mb-8">
                        <label className="block text-sm font-bold text-primary mb-2">Selecciona un Miércoles o Sábado</label>
                        <input 
                            type="date"
                            min={earliestDate.toISOString().split('T')[0]}
                            className={`w-full p-5 rounded-2xl border-2 text-xl font-serif outline-none transition-all ${selectedDate && !isStep2Valid ? 'border-red-300 bg-red-50 text-red-900' : 'border-bg focus:ring-2 focus:ring-accent'}`}
                            value={selectedDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                        />
                        {selectedDate && !isDateValid && (
                            <p className="text-red-600 text-[10px] mt-2 font-bold uppercase tracking-widest animate-bounce">⚠️ Solo entregamos los miércoles y sábados.</p>
                        )}
                        {selectedDate && isDateValid && !doesDateMatchLocation(selectedDate, locationId) && (
                            <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-widest italic">
                                📍 Esta ubicación no abre los {selectedDayName}s. Por favor elige otro día.
                            </p>
                        )}
                    </div>

                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 mb-10">
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-primary mb-2">Resumen de Logística</h4>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <p className="text-[9px] text-gray-400 uppercase">Ubicación</p>
                                <p className="text-sm font-bold text-primary">{liveLocations.find(l => l.id === locationId)?.name}</p>
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-[9px] text-gray-400 uppercase">Horario Estimado</p>
                                <p className="text-sm font-bold text-primary italic">
                                    {liveLocations.find(l => l.id === locationId)?.hours.split(',').find(h => h.includes(selectedDayName.substring(0,3))) || liveLocations.find(l => l.id === locationId)?.hours}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <Button variant="outline" onClick={() => setStep(1)} className="w-1/3 border-gray-300 hover:bg-bg">Atrás</Button>
                        <Button
                            disabled={!isStep2Valid}
                            onClick={() => setStep(3)}
                            className="w-2/3 h-16"
                        >
                            Confirmar Fecha
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Menú */}
            {step === 3 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-4xl text-primary mb-4 italic">3. Tu Pedido</h2>

                    {/* Category Tabs */}
                    <div className="flex gap-3 mb-6">
                        <button onClick={() => { setMenuTab('cookies'); }} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${menuTab === 'cookies' ? 'bg-primary text-white' : 'bg-bg text-gray-500'}`}>🍪 Galletas</button>
                        <button onClick={() => { setMenuTab('breads'); }} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${menuTab === 'breads' ? 'bg-primary text-white' : 'bg-bg text-gray-500'}`}>🍞 Pan de Masa Madre</button>
                    </div>

                    {/* Cookie box size selector */}
                    {menuTab === 'cookies' && (
                        <div className="mb-8">
                            <p className="text-primary mb-4 text-xl font-serif font-bold italic text-center">Elige el tamaño de tu caja</p>
                            <div className="flex gap-3 justify-center">
                                {[3, 6, 9].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => { setBoxSize(size); setCart({}); }}
                                        className={`px-5 py-2.5 rounded-xl border-2 font-bold transition-all text-sm ${boxSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-bg hover:border-accent text-gray-400'}`}
                                    >
                                        {size} Galletas
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 bg-bg/20 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
                                <div className={`h-full bg-primary transition-all duration-500 ${boxSize ? '' : 'opacity-0'}`} style={{ width: `${(totalCookies / (boxSize || 1)) * 100}%` }}></div>
                            </div>
                            <p className="text-center text-[10px] uppercase font-black text-primary/40 mt-2 tracking-widest">{totalCookies} de {boxSize || '?'} seleccionadas</p>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto px-2 pb-4">
                        {(menuTab === 'cookies' ? (boxSize ? liveCookies : []) : liveBreads).map((item: any) => {
                            const hoverPool = item.category === 'bread' 
                                ? ['/imagenes/IMG_6753.webp', '/imagenes/IMG_6755.webp'] 
                                : ['/imagenes/IMG_6654.webp', '/imagenes/IMG_6662.webp', '/imagenes/IMG_6756.webp'];
                            const hoverImg = hoverPool[Math.abs(item.id.length) % hoverPool.length];
                            
                            return (
                                <div key={item.id} className="checkout-product-card group bg-white rounded-2xl overflow-hidden border border-bg shadow-sm hover:shadow-md transition-all flex flex-col relative">
                                    <div className="relative w-full h-44 overflow-hidden bg-gray-50">
                                        <img src={item.image} alt={item.name} className="img-main absolute inset-0 w-full h-full object-cover transition-opacity duration-300" />
                                        <img src={hoverImg} alt={`${item.name} vista`} className="img-hover absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        {item.is_sugar_free && (
                                            <div className="absolute top-2 right-2 bg-blue-100/90 backdrop-blur-sm text-blue-700 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm z-10 border border-blue-200">Sugar Free</div>
                                        )}
                                        
                                        {/* Quick Add Overlay on Card */}
                                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/20 to-transparent flex justify-center translate-y-full group-hover:translate-y-0 transition-transform">
                                            <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-4 shadow-lg scale-90">
                                                <button onClick={() => handleRemoveCookie(item.id)} className="text-primary font-black px-2">-</button>
                                                <span className="font-serif font-black text-primary">{cart[item.id] || 0}</span>
                                                <button 
                                                    onClick={() => handleAddCookie(item.id)} 
                                                    className="text-primary font-black px-2 disabled:opacity-20"
                                                    disabled={menuTab === 'cookies' && !!boxSize && (totalCookies >= boxSize || (item.id === 'sugar-free-3pack' && totalCookies + 3 > boxSize))}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-serif text-lg text-primary font-bold italic leading-tight">{item.name}</h4>
                                            {item.price && <span className="text-sm font-black text-primary/60">${item.price}</span>}
                                        </div>
                                        <p className="text-[10px] text-gray-500 line-clamp-2 font-serif italic mb-3">{item.description}</p>
                                        
                                        {/* Mobile visible controls if no group-hover */}
                                        <div className="mt-auto flex justify-between items-center sm:hidden">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleRemoveCookie(item.id)} className="w-6 h-6 rounded-full border border-bg flex items-center justify-center text-xs">-</button>
                                                <span className="text-xs font-bold">{cart[item.id] || 0}</span>
                                                <button onClick={() => handleAddCookie(item.id)} className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">+</button>
                                            </div>
                                        </div>

                                        {item.category === 'bread' && cart[item.id] > 0 && (
                                            <div className="mt-3 pt-3 border-t border-bg flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">¿Rebanar? (+$1)</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setSlicedBreads({...slicedBreads, [item.id]: Math.max(0, (slicedBreads[item.id] || 0) - 1)})} className="w-5 h-5 rounded-full border border-bg flex items-center justify-center text-[10px]">-</button>
                                                    <span className="text-[10px] font-bold">{slicedBreads[item.id] || 0}</span>
                                                    <button onClick={() => setSlicedBreads({...slicedBreads, [item.id]: Math.min(cart[item.id], (slicedBreads[item.id] || 0) + 1)})} className="w-5 h-5 rounded-full border border-bg flex items-center justify-center text-[10px]">+</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <Button variant="outline" onClick={() => setStep(2)} className="w-1/3 border-gray-300">Atrás</Button>
                        <Button
                            disabled={totalCookies === 0 || (menuTab === 'cookies' && boxSize !== null && totalCookies !== boxSize)}
                            onClick={() => setStep(4)}
                            className="w-2/3 h-16 shadow-lg"
                        >
                            Siguiente: Tus Datos (${totalAmount.toFixed(2)})
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Tus Datos */}
            {step === 4 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-5xl md:text-6xl text-primary mb-2 italic font-black">4. Tus Datos</h2>
                    <p className="text-xl text-primary/70 mb-10 font-serif font-black">Información para la entrega y contacto.</p>

                    <div className="space-y-6 flex-1 text-lg mb-10">
                        <label className="block text-sm font-black text-primary/60 uppercase tracking-widest pl-1">Nombre completo</label>
                        <input 
                            type="text" placeholder="Nombre completo"
                            className="w-full p-6 rounded-2xl border-2 border-bg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-2xl font-bold bg-bg/10 font-serif shadow-sm transition-all"
                            value={customer.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer({...customer, name: e.target.value})}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                            <input 
                                type="tel" placeholder="Teléfono"
                                className="w-full p-6 rounded-2xl border-2 border-bg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-2xl font-bold bg-bg/10 font-serif shadow-sm transition-all"
                                value={customer.phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer({...customer, phone: e.target.value})}
                            />
                            <input 
                                type="email" placeholder="Email"
                                className="w-full p-6 rounded-2xl border-2 border-bg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-2xl font-bold bg-bg/10 font-serif shadow-sm transition-all"
                                value={customer.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer({...customer, email: e.target.value})}
                            />
                        </div>

                        <div className="pt-8 mt-8 border-t border-bg text-center">
                            <label className="flex items-center gap-3 cursor-pointer mb-6 group justify-center">
                                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${gift.is_gift ? 'bg-primary border-primary text-white' : 'border-bg/50 group-hover:border-primary/50'}`}>
                                    {gift.is_gift && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                </div>
                                <input type="checkbox" className="hidden" checked={gift.is_gift} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGift({...gift, is_gift: e.target.checked})} />
                                <span className="font-serif text-3xl italic text-primary">¿Es un regalo? 🎁</span>
                            </label>
                            {gift.is_gift && (
                                <textarea 
                                    className="w-full p-6 rounded-2xl border-2 border-bg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xl h-40 bg-bg/10 font-serif shadow-sm transition-all italic"
                                    placeholder="Escribe tu mensaje..."
                                    value={gift.message}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGift({...gift, message: e.target.value})}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <Button variant="outline" onClick={() => setStep(3)} className="w-1/3 border-gray-300">Atrás</Button>
                        <Button
                            disabled={!customer.name || !customer.phone}
                            onClick={() => setStep(5)}
                            className="w-2/3 h-16 shadow-lg"
                        >
                            Finalizar Pedido
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 5: Pago */}
            {step === 5 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-4xl text-primary mb-2 italic">5. Confirmación</h2>
                    <p className="text-gray-600 mb-10 font-serif">Revisa tu resumen y elige el método de pago.</p>

                    <div className="bg-bg/10 p-8 rounded-[2rem] border border-bg mb-8 shadow-inner">
                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/40 mb-6 text-center">Detalle de tu Recibo</h4>
                        <ul className="space-y-3 font-serif text-lg italic mb-6 text-primary">
                            {Object.entries(cart).map(([id, qty]) => (
                                <li key={id} className="flex justify-between items-center border-b border-primary/5 pb-2">
                                    <span className="flex items-center gap-2">
                                        <span className="bg-primary/10 w-6 h-6 flex items-center justify-center rounded text-[10px] font-black not-italic">{qty}x</span>
                                        {allLiveProducts.find((f: any) => f.id === id)?.name}
                                    </span>
                                    <span className="font-bold">${((allLiveProducts.find((f: any) => f.id === id)?.price || 12) * qty).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between font-serif text-3xl text-primary font-bold pt-4">
                            <span>Total</span>
                            <span className="underline decoration-accent decoration-4 underline-offset-4">${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mb-10">
                        <button 
                            onClick={() => setPaymentMethod('transfer')}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'transfer' ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-bg opacity-60'}`}>
                            <h5 className="font-serif italic font-bold text-primary text-xl">Transferencia</h5>
                            <p className="text-[10px] uppercase font-black tracking-widest text-primary/40 mt-1">Zelle / Venmo</p>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-bg opacity-60'}`}>
                            <h5 className="font-serif italic font-bold text-primary text-xl">Efectivo</h5>
                            <p className="text-[10px] uppercase font-black tracking-widest text-primary/40 mt-1">Pago al recibir</p>
                        </button>
                    </div>

                    {paymentMethod === 'transfer' && (
                        <div className="bg-bg/20 p-8 rounded-3xl border border-primary/20 mb-10 max-w-sm mx-auto font-serif animate-fade-in shadow-lg">
                            <h4 className="italic text-2xl text-primary mb-6 text-center font-bold">Datos de Pago</h4>
                            <div className="space-y-4 text-left mb-8 font-serif">
                                <div className="flex justify-between border-b border-primary/10 pb-2">
                                    <span className="opacity-60 text-sm">Zelle/Apple Pay:</span>
                                    <span className="font-bold text-primary">430 324 2593</span>
                                </div>
                                <div className="flex justify-between border-b border-primary/10 pb-2">
                                    <span className="opacity-60 text-sm">Nombre:</span>
                                    <span className="font-bold text-primary">Maria Soto</span>
                                </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded-2xl w-44 h-44 mx-auto mb-4 border border-primary/5 shadow-inner">
                                <img src="/imagenes/zelle.png" alt="Zelle QR" className="w-full h-full object-contain" />
                            </div>
                            <p className="text-[9px] uppercase font-black tracking-widest text-primary/40 text-center mb-8">Escanea para pagar</p>

                            <div className="pt-6 border-t border-primary/10">
                                <label className="block text-xs font-black uppercase tracking-widest text-primary mb-3">Sube tu comprobante *</label>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiptFile(e.target.files?.[0] || null)}
                                        className="w-full text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                                    />
                                    {receiptFile && <p className="text-[10px] text-accent font-bold mt-2">✨ Recibo seleccionado: {receiptFile.name}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-auto">
                        <Button variant="outline" onClick={() => setStep(4)} className="w-1/3 border-gray-300">Atrás</Button>
                        <Button
                            disabled={!paymentMethod || (paymentMethod === 'transfer' && !receiptFile) || isUploading}
                            onClick={async () => {
                                try {
                                    setIsUploading(true);
                                    let receiptUrl = '';
                                    if (paymentMethod === 'transfer' && receiptFile) {
                                        const formData = new FormData();
                                        formData.append('receipt', receiptFile);
                                        formData.append('customer_name', customer.name);
                                        const res = await fetch('/api/upload-receipt', { method: 'POST', body: formData });
                                        if (res.ok) {
                                            const data = await res.json();
                                            receiptUrl = data.url;
                                        }
                                    }

                                    const orderMetadata = {
                                        gift_message: gift.is_gift ? gift.message : '',
                                        receipt_url: receiptUrl,
                                        sliced: slicedBreads,
                                        remarks: remarks
                                    };

                                    // Build a clean notes string for the 'notes' column
                                    let cleanNotes = remarks.trim();
                                    if (gift.is_gift) cleanNotes = `[REGALO] ${gift.message}${cleanNotes ? ' | ' + cleanNotes : ''}`;
                                    if (receiptUrl) cleanNotes = `${cleanNotes ? cleanNotes + ' | ' : ''}Comprobante: ${receiptUrl}`;
                                    if (Object.keys(slicedBreads).length > 0) {
                                        const slices = Object.entries(slicedBreads).map(([id, q]) => `${q}x ${allLiveProducts.find((f:any)=>f.id===id)?.name}`).join(', ');
                                        cleanNotes = `${cleanNotes ? cleanNotes + ' | ' : ''}Rebanar: ${slices}`;
                                    }

                                    await createOrder({
                                        customer_name: customer.name, // Just the name now!
                                        customer_phone: customer.phone,
                                        customer_email: customer.email,
                                        phone: customer.phone, // New column
                                        email: customer.email, // New column
                                        notes: cleanNotes,     // New column
                                        location_id: locationId, 
                                        pickup_day: selectedDate,
                                        box_size: boxSize ?? totalCookies,
                                        flavors_selected: cart,
                                        total_price: totalAmount,
                                        status: 'Pendiente'
                                    } as any);
                                    setStep(6);
                                } catch (e: any) {
                                    console.error("Order failed:", e);
                                    alert(`Hubo un error crítico: ${e?.message}. Toma captura a tu recibo y envíanosla por WhatsApp.`);
                                } finally {
                                    setIsUploading(false);
                                }
                            }}
                            className="w-2/3 h-16 text-xl shadow-xl"
                        >
                            {isUploading ? 'Generando Magia...' : `Confirmar Pedido`}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 6: Success */}
            {step === 6 && (
                <div className="animate-fade-in flex-1 text-center py-10">
                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-10 group">
                        {['/imagenes/IMG_6657.webp', '/imagenes/IMG_6749.webp', '/imagenes/IMG_6360.webp'].map((img, i) => (
                            <div key={i} className={`aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white transform transition-all duration-700 ${i === 1 ? 'scale-110 -rotate-3 z-10 hover:scale-125' : 'scale-90 rotate-3 opacity-60 hover:opacity-100 hover:scale-110'}`}>
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    <h2 className="font-serif text-5xl md:text-6xl text-primary mb-6 italic leading-tight">
                        ¡Listo, <span className="font-bold underline decoration-accent decoration-4">{customer.name.split(' ')[0]}!</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-sm mx-auto leading-relaxed font-serif italic">
                        Tu pedido ha sido recibido con amor. Pronto recibirás noticias nuestras para la entrega.
                    </p>

                    <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 mb-12 max-w-md mx-auto relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -translate-y-10 translate-x-10"></div>
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-primary/40 mb-4">¿Qué sigue?</h4>
                        <p className="text-sm text-primary leading-relaxed font-bold italic mb-6">
                            Estaremos preparando tus productos en nuestro próximo lote. Si tienes dudas, contáctanos directamente.
                        </p>
                        <a href="https://wa.me/14303242593" target="_blank" rel="noopener noreferrer">
                            <Button className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-md">Escríbenos por WhatsApp</Button>
                        </a>
                    </div>

                    <Button 
                        onClick={() => window.location.href = '/'}
                        variant="outline"
                        className="w-full h-14 text-sm font-black uppercase tracking-widest max-w-xs mx-auto border-bg hover:bg-bg"
                    >
                        Volver al Inicio
                    </Button>
                </div>
            )}
        </div>
    );
};
