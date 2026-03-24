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
                        return { ...s, ...c, description: c.description ?? (s as any).description, ingredients: c.ingredients ?? (s as any).ingredients };
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
                    <h2 className="font-serif text-4xl text-primary mb-2 italic">1. Punto de Entrega</h2>
                    <p className="text-gray-600 mb-8 font-serif">Elige dónde recogerás tu pedido. <span className="text-accent italic">Solo entregamos Miércoles y Sábados.</span></p>

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
                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary mb-2">Resumen de Logística</h4>
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
                        <button onClick={() => { setMenuTab('cookies'); }} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${menuTab === 'cookies' ? 'bg-primary text-white' : 'bg-bg text-gray-500'}`}>🍪 Galletas</button>
                        <button onClick={() => { setMenuTab('breads'); }} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${menuTab === 'breads' ? 'bg-primary text-white' : 'bg-bg text-gray-500'}`}>🍞 Pan de Masa Madre</button>
                    </div>

                    {/* Cookie box size selector (only for cookie tab) */}
                    {menuTab === 'cookies' && (
                        <div className="mb-6">
                            <p className="text-gray-600 mb-4 text-sm font-serif">Elige el tamaño de tu caja ({totalCookies}/{boxSize ?? '?'})</p>
                            <div className="flex gap-4 justify-center">
                                {[3, 6, 9].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => { setBoxSize(size); setCart(prev => { const next: Record<string, number> = {}; Object.entries(prev).filter(([id]) => liveBreads.some((b: any) => b.id === id)).forEach(([id, q]) => { next[id] = q as number; }); return next; }); }}
                                        className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${boxSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-bg hover:border-accent text-gray-500'}`}
                                    >
                                        {size} Galletas
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product list */}
                    <div className="mb-10 space-y-4 max-h-[380px] overflow-y-auto px-2">
                        {(menuTab === 'cookies' ? (boxSize ? liveCookies : []) : liveBreads).map((item: any) => (
                            <div key={item.id} className="flex flex-col bg-bg/5 p-4 rounded-xl border border-bg relative overflow-hidden group">
                                {item.is_sugar_free && (
                                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm z-10 border border-blue-200">Sugar Free</div>
                                )}
                                {item.image && (
                                    <div className="w-full h-40 mb-4 rounded-lg overflow-hidden shadow-sm border border-primary/10">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-serif text-2xl italic text-primary">{item.name}</span>
                                            {item.price && <span className="text-lg font-bold text-primary">${item.price}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleRemoveCookie(item.id)} className="w-8 h-8 rounded-full bg-white border border-bg text-primary font-bold disabled:opacity-30 flex items-center justify-center" disabled={!cart[item.id]}>-</button>
                                        <span className="w-4 text-center font-bold font-serif">{cart[item.id] || 0}</span>
                                        <button
                                            onClick={() => handleAddCookie(item.id)}
                                            className="w-8 h-8 rounded-full bg-primary text-white font-bold disabled:opacity-30 flex items-center justify-center"
                                            disabled={menuTab === 'cookies' && !!boxSize && (totalCookies >= boxSize || (item.id === 'sugar-free-3pack' && totalCookies + 3 > boxSize))}
                                        >+</button>
                                    </div>
                                </div>
                                {item.description && <p className="text-base text-gray-700 mt-2 font-serif leading-relaxed">{item.description}</p>}
                                {item.ingredients && <p className="text-xs text-gray-500 italic mt-1 font-serif">{item.ingredients}</p>}
                                
                                {item.category === 'bread' && cart[item.id] > 0 && (
                                    <div className="mt-4 p-3 bg-bg/30 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-primary uppercase tracking-wider">¿Rebanar pan? (+$1 c/u)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setSlicedBreads({...slicedBreads, [item.id]: Math.max(0, (slicedBreads[item.id] || 0) - 1)})}
                                                className="w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary disabled:opacity-30"
                                                disabled={!(slicedBreads[item.id] > 0)}
                                            >-</button>
                                            <span className="text-sm font-bold w-4 text-center">{slicedBreads[item.id] || 0}</span>
                                            <button 
                                                onClick={() => setSlicedBreads({...slicedBreads, [item.id]: Math.min(cart[item.id], (slicedBreads[item.id] || 0) + 1)})}
                                                className="w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-primary disabled:opacity-30"
                                                disabled={slicedBreads[item.id] >= cart[item.id]}
                                            >+</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <Button variant="outline" onClick={() => setStep(2)} className="w-1/3 border-gray-300">Atrás</Button>
                        <Button
                            disabled={totalCookies === 0 || (menuTab === 'cookies' && boxSize !== null && totalCookies !== boxSize)}
                            onClick={() => setStep(4)}
                            className="w-2/3 h-16"
                        >
                            Ver Tus Datos (${totalAmount.toFixed(2)})
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Tus Datos */}
            {step === 4 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-4xl text-primary mb-2 italic">4. Tus Datos</h2>
                    <p className="text-gray-600 mb-10 font-serif">Información para la entrega y contacto.</p>

                    <div className="space-y-6 mb-10">
                        <input 
                            type="text" placeholder="Nombre completo"
                            className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-accent outline-none font-serif"
                            value={customer.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer({...customer, name: e.target.value})}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                            <input 
                                type="tel" placeholder="Teléfono"
                                className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-accent outline-none font-serif"
                                value={customer.phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer({...customer, phone: e.target.value})}
                            />
                            <input 
                                type="email" placeholder="Email"
                                className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-accent outline-none font-serif"
                                value={customer.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer({...customer, email: e.target.value})}
                            />
                        </div>

                        <div className="pt-6 border-t border-bg">
                            <label className="flex items-center gap-2 cursor-pointer font-serif">
                                <input type="checkbox" className="w-5 h-5 accent-primary" checked={gift.is_gift} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGift({...gift, is_gift: e.target.checked})} />
                                <span className="italic text-primary">¿Es un regalo? 🎁</span>
                            </label>
                            {gift.is_gift && (
                                <textarea 
                                    className="w-full mt-4 p-4 rounded-xl border border-bg focus:ring-2 focus:ring-accent outline-none h-24 italic font-serif"
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
                            className="w-2/3 h-16"
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

                    <div className="bg-bg/10 p-6 rounded-3xl border border-bg mb-8">
                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary mb-4">Resumen de Compra</h4>
                        <ul className="space-y-2 text-sm italic mb-4 font-serif text-gray-700">
                            {Object.entries(cart).map(([id, qty]) => (
                                <li key={id} className="flex justify-between border-b border-bg/20 pb-1">
                                    <span>{qty}x {allLiveProducts.find((f: any) => f.id === id)?.name}</span>
                                    <span>${((allLiveProducts.find((f: any) => f.id === id)?.price || 12) * qty).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between font-serif text-2xl text-primary font-bold">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mb-10">
                        <button 
                            onClick={() => setPaymentMethod('transfer')}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-bg'}`}>
                            <h5 className="font-serif italic font-bold text-primary text-lg">Transferencia</h5>
                            <p className="text-[10px] uppercase tracking-tighter opacity-60">Zelle / Venmo</p>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-bg'}`}>
                            <h5 className="font-serif italic font-bold text-primary text-lg">Efectivo</h5>
                            <p className="text-[10px] uppercase tracking-tighter opacity-60">Pago al recibir</p>
                        </button>
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <Button variant="outline" onClick={() => setStep(4)} className="w-1/3 border-gray-300">Atrás</Button>
                        <Button
                            disabled={!paymentMethod}
                            onClick={async () => {
                                try {
                                    await createOrder({
                                        customer_name: customer.name,
                                        customer_phone: customer.phone,
                                        customer_email: customer.email,
                                        location_id: locationId, 
                                        pickup_day: selectedDate,
                                        box_size: boxSize ?? totalCookies,
                                        flavors_selected: cart,
                                        sliced_breads: slicedBreads,
                                        total_price: totalAmount,
                                        notes: gift.is_gift ? `[REGALO] De: ${customer.name}\nMensaje: ${gift.message}\nNotas: ${remarks}` : remarks,
                                        status: 'Pendiente'
                                    } as any);
                                    setStep(6);
                                } catch (e) {
                                    console.error("Order failed:", e);
                                    setStep(6); 
                                }
                            }}
                            className="w-2/3 h-16 text-xl"
                        >
                            Confirmar (${totalAmount.toFixed(2)})
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 6: Success */}
            {step === 6 && (
                <div className="animate-fade-in flex-1 text-center py-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="font-serif text-4xl text-primary mb-4 italic">¡Pedido Recibido!</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto font-serif">
                        Gracias <strong>{customer.name.split(' ')[0]}</strong>, hemos registrado tu pedido.
                    </p>

                    {paymentMethod === 'transfer' ? (
                        <div className="bg-bg/20 p-8 rounded-3xl border border-primary/20 mb-10 max-w-sm mx-auto font-serif">
                            <h4 className="italic text-xl text-primary mb-4">Datos para Transferencia</h4>
                            <div className="space-y-4 text-left text-sm mb-6 font-serif">
                                <div className="flex justify-between border-b border-primary/10 pb-2">
                                    <span className="opacity-60 font-serif">Zelle/Apple Pay:</span>
                                    <span className="font-bold">430 324 2593</span>
                                </div>
                                <div className="flex justify-between border-b border-primary/10 pb-2">
                                    <span className="opacity-60 font-serif">Nombre:</span>
                                    <span className="font-bold">Maria Soto</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-60 font-serif">Total:</span>
                                    <span className="font-bold text-lg text-primary">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            {/* Zelle QR Code */}
                            <div className="bg-white p-2 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center border border-primary/5 shadow-md overflow-hidden">
                                <img src="/imagenes/zelle.png" alt="Zelle QR Code" className="w-full h-full object-contain" />
                            </div>
                            <p className="text-[10px] mt-4 uppercase tracking-wider text-primary/60 italic font-bold">Escanea para pagar con Zelle</p>
                        </div>
                    ) : (
                        <div className="bg-bg/20 p-8 rounded-3xl border border-primary/20 mb-10 max-w-sm mx-auto font-serif">
                            <h4 className="italic text-xl text-primary mb-4">Pago en Efectivo</h4>
                            <p className="text-sm italic text-gray-600">
                                Recuerda tener listos <strong>${totalAmount.toFixed(2)}</strong> al momento de la entrega o recolección.
                            </p>
                        </div>
                    )}

                    <Button 
                        onClick={() => window.location.href = '/'}
                        className="w-full h-16 text-lg max-w-xs mx-auto"
                    >
                        Volver al Inicio
                    </Button>
                </div>
            )}
        </div>
    );
};
