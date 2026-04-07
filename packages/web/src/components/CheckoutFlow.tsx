import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { cartStore, addToCart, removeFromCart, updateQuantity } from '../stores/cartStore';
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
import { CustomCalendar } from './CustomCalendar';

export const CheckoutFlow: React.FC = () => {
    const { items: cartItems, gift: cartGift } = useStore(cartStore);

    // Data states
    const [liveLocations, setLiveLocations] = useState<PickupLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Flow states
    const [step, setStep] = useState(1);
    const [logistics, setLogistics] = useState<'pickup' | 'delivery' | null>('pickup');
    const [zipCode, setZipCode] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [locationId, setLocationId] = useState('');
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
    const [remarks, setRemarks] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | null>(null);
    const [slicedBreads, setSlicedBreads] = useState<Record<string, number>>({});
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [extrasTab, setExtrasTab] = useState<'cookies' | 'breads'>('cookies');
    const [orderError, setOrderError] = useState<string | null>(null);

    const earliestDate = getEarliestAvailableDate();

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch from DB to get is_sold_out status (managed by admin)
                // But use hardcoded pickupLocations as source of truth for content
                const response = await fetch('/api/storefront-data');
                const data = response.ok ? await response.json() : {};
                const dbLocations: any[] = data.locations || [];
                const merged = pickupLocations
                    .map(loc => {
                        const db = dbLocations.find((d: any) => d.id === loc.id);
                        return { ...loc, isSoldOut: db?.isSoldOut ?? false };
                    })
                    .filter(loc => !loc.isSoldOut);
                setLiveLocations(merged.length > 0 ? merged : pickupLocations);
            } catch (error) {
                setLiveLocations(pickupLocations);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const cartItemsList = Object.values(cartItems);
    const totalAmount = cartItemsList.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const selectedLocation = liveLocations.find(l => l.id === locationId);
    const isSpecialLocation = locationId === 'special-coordination';
    const allowedCalendarDays = selectedLocation?.days || ['Wednesday', 'Saturday'];
    const isStep2Valid = isSpecialLocation || (selectedDate && isWednesdayOrSaturday(selectedDate));

    const allBoxesFull = useMemo(() => {
        return cartItemsList
            .filter(i => i.boxSize)
            .every(box => {
                const filled = Object.values(box.selections || {}).reduce((a, b) => a + b, 0);
                return filled === box.boxSize;
            });
    }, [cartItems]);

    const handleBoxSelection = (boxId: string, flavorName: string, delta: number) => {
        const item = cartItems[boxId];
        if (!item || !item.boxSize) return;
        
        const currentSelections = item.selections || {};
        const currentTotal = Object.values(currentSelections).reduce((a, b) => a + b, 0);
        if (delta > 0 && currentTotal >= item.boxSize) return;
        if (delta < 0 && (currentSelections[flavorName] || 0) <= 0) return;

        const newSelections = { ...currentSelections };
        newSelections[flavorName] = (newSelections[flavorName] || 0) + delta;
        if (newSelections[flavorName] <= 0) delete newSelections[flavorName];

        cartStore.set({
            ...cartStore.get(),
            items: {
                ...cartItems,
                [boxId]: { ...item, selections: newSelections }
            }
        });
    };

    const clearBox = (boxId: string) => {
        const item = cartItems[boxId];
        if (!item) return;
        cartStore.set({
            ...cartStore.get(),
            items: {
                ...cartItems,
                [boxId]: { ...item, selections: {} }
            }
        });
    };
    const nextStep1Ref = React.useRef<HTMLDivElement>(null);
    const nextStep2Ref = React.useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (step === 1 && locationId) {
            nextStep1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [logistics, locationId, step]);

    useEffect(() => {
        if (step === 2 && selectedDate) {
            nextStep2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedDate, step]);

    const handleSubmitOrder = async () => {
        setIsUploading(true);
        setOrderError(null);
        try {
            // Flatten flavors for Admin Dashboard (ID -> Quantity)
            const flattened: Record<string, number> = {};
            const boxGroups: string[] = [];
            
            cartItemsList.forEach(item => {
                if (item.boxSize && item.selections) {
                    const flavors: string[] = [];
                    Object.entries(item.selections).forEach(([name, qty]) => {
                        const flavorObj = cookieFlavors.find(f => f.name === name);
                        const id = flavorObj?.id || name;
                        flattened[id] = (flattened[id] || 0) + (qty as number);
                        if (qty > 0) flavors.push(`${qty}x ${name}`);
                    });
                    boxGroups.push(`Caja de ${item.boxSize}: [${flavors.join(', ')}]`);
                } else {
                    flattened[item.id] = (flattened[item.id] || 0) + (item.quantity || 1);
                }
            });

            const firstBox = cartItemsList.find(i => i.boxSize);
            const orderNotes = [
                ...boxGroups,
                cartGift.is_gift ? `\uD83C\uDF81 REGALO: ${cartGift.message}` : '',
                remarks,
                receiptFile ? '\uD83D\uDCCE Comprobante adjunto' : ''
            ].filter(Boolean).join(' | ');

            const orderData = {
                customer_name: customer.name,
                customer_phone: customer.phone,   // ← matches NOT NULL column
                customer_email: customer.email,
                location_id: locationId,
                pickup_day: selectedDate,
                box_size: firstBox?.boxSize || 0,
                // Stringify to ensure JSONB compatibility
                flavors_selected: JSON.stringify(flattened),
                total_price: totalAmount,
                status: 'Pendiente',
                notes: orderNotes
            };

            await createOrder(orderData);
            setStep(6);
            cartStore.set({ items: {}, gift: { is_gift: false, message: '' }, isOpen: false });
        } catch (e: any) { 
            console.error('Order error:', e);
            const msg = e?.message || JSON.stringify(e) || 'Error desconocido';
            setOrderError(msg);
        } finally { 
            setIsUploading(false); 
        }
    };

    if (isLoading) return <div className="text-center py-20 animate-pulse text-primary font-serif italic text-2xl font-bold">Iniciando horno...</div>;

    const steps = ["Logística", "Fecha", "Personalizar", "Datos", "Pago"];

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-primary/5 min-h-[700px] flex flex-col font-sans">
            {/* Nav */}
            <div className="flex justify-between mb-16 px-4">
                {steps.map((s, i) => (
                    <div key={s} className="flex flex-col items-center flex-1">
                        <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${step >= i+1 ? 'bg-primary shadow-[0_0_10px_rgba(54,111,95,0.3)]' : 'bg-primary/10'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest mt-3 ${step === i+1 ? 'text-primary' : 'text-primary/20'}`}>{s}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Logistics */}
            {step === 1 && (
                <div className="animate-fade-in space-y-10">
                    <div className="text-center max-w-md mx-auto">
                        <h2 className="font-serif text-5xl text-primary italic mb-3">Tu Entrega</h2>
                        <p className="text-primary/60 font-serif">Elige tu punto de recolección.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {liveLocations.filter(l => l.id !== 'special-coordination').map(l => (
                            <button key={l.id} onClick={() => { setLocationId(l.id); setSelectedDate(''); }} className={`p-6 rounded-3xl border-2 text-left transition-all ${locationId === l.id ? 'border-primary bg-white shadow-lg' : 'border-primary/5 bg-bg/5 hover:bg-white'}`}>
                                <h4 className="font-serif text-lg text-primary">{l.name}</h4>
                                <p className="text-xs text-primary/60 mt-1 font-bold">{l.hours}</p>
                                <p className="text-xs text-primary/40 truncate mt-0.5">{l.address}</p>
                            </button>
                        ))}
                    </div>
                    {/* Special coordination option */}
                    <button
                        onClick={() => { setLocationId('special-coordination'); setSelectedDate('coordination'); }}
                        className={`w-full p-6 rounded-3xl border-2 text-left transition-all ${locationId === 'special-coordination' ? 'border-primary bg-white shadow-lg' : 'border-dashed border-primary/20 bg-bg/5 hover:bg-white'}`}
                    >
                        <h4 className="font-serif text-lg text-primary">Lavon · Princeton · Wylie</h4>
                        <p className="text-xs text-primary/60 mt-1">Si eres de estas áreas, selecciona esta opción y te haremos llegar los días donde podemos coordinar tu entrega.</p>
                    </button>

                    <div className="pt-10" ref={nextStep1Ref}>
                        <Button disabled={!locationId} onClick={() => setStep(2)} className="w-full h-20 text-xl font-black rounded-3xl shadow-xl">SIGUIENTE PASO</Button>
                    </div>
                </div>
            )}

            {/* Step 2: Calendar */}
            {step === 2 && (
                <div className="animate-fade-in space-y-10">
                    <div className="text-center">
                        <h2 className="font-serif text-5xl text-primary italic">¿Cuándo?</h2>
                        <p className="text-primary/40 text-xs font-black uppercase tracking-widest mt-4">
                            {isSpecialLocation ? 'Coordinaremos tu fecha de entrega' :
                                allowedCalendarDays.length === 1
                                    ? `Solo ${allowedCalendarDays[0] === 'Wednesday' ? 'Miércoles' : 'Sábados'}`
                                    : 'Miércoles y Sábados'}
                        </p>
                    </div>
                    {isSpecialLocation ? (
                        <div className="max-w-md mx-auto bg-primary/5 border border-primary/10 rounded-[2rem] p-10 text-center">
                            <span className="text-5xl block mb-4">📍</span>
                            <p className="font-serif text-xl text-primary italic leading-relaxed">
                                Nos pondremos en contacto contigo para coordinar la mejor fecha y hora de entrega para tu zona.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto">
                            <CustomCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} minDate={earliestDate} allowedDays={allowedCalendarDays as ('Wednesday' | 'Saturday')[]} />
                        </div>
                    )}
                    <div className="flex gap-6 mt-10" ref={nextStep2Ref}>
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-16 border-primary/20 text-primary/60 rounded-2xl">ATRÁS</Button>
                        <Button disabled={!isStep2Valid} onClick={() => setStep(3)} className="flex-[2] h-16 rounded-2xl shadow-lg">ARMAR TU PEDIDO</Button>
                    </div>
                </div>
            )}

            {/* Step 3: Box Builder & Extras Picker */}
            {step === 3 && (
                <div className="animate-fade-in space-y-10">
                    <div className="text-center">
                        <h2 className="font-serif text-5xl text-primary italic">Personaliza</h2>
                        <p className="text-primary/60 font-serif text-lg mt-2">Elige tus sabores y añade extras del horno.</p>
                    </div>

                    {/* Cookie Boxes */}
                    {cartItemsList.filter(i => i.boxSize).map(box => {
                        const boxSize = box.boxSize || 3;
                        const filled = Object.values(box.selections || {}).reduce((a, b) => a + b, 0);
                        const remaining = boxSize - filled;
                        return (
                            <div key={box.id} className="bg-primary/5 p-6 md:p-10 rounded-[3rem] border border-primary/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-bl-full translate-x-10 -translate-y-10 pointer-events-none" />

                                {/* Box Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div>
                                        <h3 className="font-serif text-3xl md:text-4xl text-primary italic font-bold">Tu Caja de {boxSize} 🍪</h3>
                                        <div className="flex gap-1.5 mt-3">
                                            {Array.from({ length: boxSize }).map((_, i) => (
                                                <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${i < filled ? 'bg-accent w-10 shadow-sm' : 'bg-primary/15 w-6'}`} />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-black uppercase tracking-widest mt-3 ${remaining === 0 ? 'text-primary' : 'text-accent'}`}>
                                            {remaining === 0 ? '✅ ¡Caja completa!' : `⚡ Faltan ${remaining} galleta${remaining !== 1 ? 's' : ''}`}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => clearBox(box.id)} className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-primary/5 whitespace-nowrap">Limpiar</button>
                                        <button onClick={() => removeFromCart(box.id)} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors bg-white/50 px-4 py-2 rounded-full border border-red-100 whitespace-nowrap">Eliminar caja</button>
                                    </div>
                                </div>

                                {/* Cookies Selection Summary */}
                                {filled > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {Object.entries(box.selections || {}).map(([name, qty]) => (
                                            <span key={name} className="bg-accent/10 text-accent text-xs font-black px-3 py-1.5 rounded-full border border-accent/20">
                                                {qty}x {name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Flavor Picker Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                                    {cookieFlavors.map(f => {
                                        const count = box.selections?.[f.name] || 0;
                                        const isAtMax = filled >= boxSize && count === 0;
                                        return (
                                            <div
                                                key={f.id}
                                                onClick={() => !isAtMax && handleBoxSelection(box.id, f.name, 1)}
                                                className={`bg-white p-4 rounded-[2rem] flex flex-col items-center gap-3 border-2 transition-all select-none
                                                    ${count > 0 ? 'border-accent ring-2 ring-accent/10 shadow-lg shadow-accent/5' : 'border-primary/5 shadow-sm'}
                                                    ${isAtMax ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:border-primary/20'}`}
                                            >
                                                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${count > 0 ? 'border-accent scale-110' : 'border-primary/5'}`}>
                                                    <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[11px] font-bold text-primary text-center leading-tight">{f.name}</span>
                                                <div
                                                    className="flex items-center gap-3 bg-bg/50 rounded-full px-3 py-1 border border-primary/5"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={() => handleBoxSelection(box.id, f.name, -1)}
                                                        className="font-black text-primary w-6 h-6 flex items-center justify-center hover:text-accent transition-colors"
                                                    >−</button>
                                                    <span className="text-sm font-black text-primary min-w-[1.25rem] text-center">{count}</span>
                                                    <button
                                                        onClick={() => !isAtMax && handleBoxSelection(box.id, f.name, 1)}
                                                        className={`font-black w-6 h-6 flex items-center justify-center transition-colors ${isAtMax ? 'text-primary/20' : 'text-primary hover:text-accent'}`}
                                                    >+</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Extras Panel — Tabbed: Galletas & Panes */}
                    <div className="mt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px flex-1 bg-primary/10" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Añadir extras del horno</span>
                            <div className="h-px flex-1 bg-primary/10" />
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => setExtrasTab('cookies')}
                                className={`flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border-2 ${
                                    extrasTab === 'cookies'
                                        ? 'bg-primary text-bg border-primary shadow-lg'
                                        : 'bg-white text-primary border-primary/10 hover:border-primary/30'
                                }`}
                            >
                                🍪 Galletas extra
                            </button>
                            <button
                                onClick={() => setExtrasTab('breads')}
                                className={`flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border-2 ${
                                    extrasTab === 'breads'
                                        ? 'bg-primary text-bg border-primary shadow-lg'
                                        : 'bg-white text-primary border-primary/10 hover:border-primary/30'
                                }`}
                            >
                                🍞 Panes
                            </button>
                        </div>

                        {/* Tab: Extra Cookies — pick a box size, customize flavors above */}
                        {extrasTab === 'cookies' && (
                            <div className="space-y-4">
                                <p className="text-xs text-primary/50 italic text-center px-4">
                                    Elige el tamaño de la caja. Podrás personalizar los sabores en la sección de arriba.
                                </p>
                                {[
                                    { id: 'extra-box-3', count: 3, price: 12.00, label: 'Standard Box (3)', sub: '3 galletas artesanales' },
                                    { id: 'extra-box-6', count: 6, price: 22.00, label: 'Family Box (6)', sub: '6 galletas artesanales' },
                                    { id: 'extra-box-9', count: 9, price: 31.50, label: 'Party Box (9)', sub: '9 galletas artesanales' }
                                ].map(plan => (
                                    <button
                                        key={plan.id}
                                        onClick={() => addToCart({
                                            id: plan.id,
                                            name: 'Galletas Artesanales',
                                            category: 'cookie',
                                            price: plan.price,
                                            boxSize: plan.count,
                                            boxLabel: plan.label,
                                            image: '/imagenes/cookie-choconuts.webp',
                                            description: 'Mix de sabores a elegir',
                                        }, '')}
                                        className="w-full p-5 rounded-2xl border-2 border-primary/10 hover:border-primary bg-white flex justify-between items-center group hover:shadow-md transition-all"
                                    >
                                        <div className="text-left">
                                            <span className="font-serif text-xl text-primary italic font-bold">{plan.label}</span>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{plan.sub} · personaliza sabores arriba</p>
                                        </div>
                                        <span className="font-black text-primary text-2xl group-hover:scale-110 transition-transform">${plan.price.toFixed(2)}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Tab: Breads */}
                        {extrasTab === 'breads' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {breadFlavors.map(b => (
                                    <div key={b.id} className="bg-white rounded-[2.5rem] border border-primary/10 overflow-hidden flex flex-col hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group">
                                        <div className="w-full h-44 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none"></div>
                                            <img src={b.image || '/imagenes/IMG_6703.webp'} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <h4 className="absolute bottom-5 left-6 right-6 font-serif text-2xl text-white italic font-bold leading-tight z-20 drop-shadow-md">{b.name}</h4>
                                        </div>
                                        <div className="p-6 bg-gradient-to-b from-white to-primary/5 flex flex-col justify-between gap-5 flex-1">
                                            <p className="text-sm text-primary/60 leading-relaxed line-clamp-2">{b.description}</p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => addToCart({ ...b, category: 'bread' })}
                                                    className="flex-[3] bg-primary text-bg text-[11px] font-black uppercase tracking-widest py-3.5 rounded-[1.2rem] hover:bg-primary/90 hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                                                >
                                                    Hogaza ${b.price}
                                                </button>
                                                <button
                                                    onClick={() => addToCart({ ...b, id: `${b.id}-slice`, name: `Rebanada de ${b.name}`, price: 1, category: 'bread' })}
                                                    className="flex-[2] bg-accent/10 text-accent text-[11px] font-black uppercase tracking-widest py-3.5 rounded-[1.2rem] hover:bg-accent hover:text-white hover:-translate-y-0.5 transition-all border border-accent/20 flex items-center justify-center"
                                                >
                                                    Rebanada $1
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-8 flex flex-col gap-4">
                        {!allBoxesFull && cartItemsList.length > 0 && (
                            <p className="text-center text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
                                Por favor llena todas tus cajas con sabores antes de continuar 🍪
                            </p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-16 text-primary font-black tracking-widest rounded-2xl">← FECHA</Button>
                            <Button
                                disabled={!allBoxesFull || cartItemsList.length === 0}
                                onClick={() => setStep(4)}
                                className="flex-[2] h-20 shadow-2xl rounded-3xl font-black text-lg transition-all"
                            >
                                CONFIRMAR PEDIDO — ${totalAmount.toFixed(2)}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4 & 5 same refined logic */}
            {step >= 4 && step <= 5 && (
                <div className="animate-fade-in space-y-12">
                    <div className="text-center">
                        <h2 className="font-serif text-5xl text-primary italic">{step === 4 ? 'Tus Datos' : 'El Pago'}</h2>
                    </div>
                    {step === 4 ? (
                        <div className="space-y-6 max-w-2xl mx-auto w-full">
                            {/* Resumen del pedido */}
                            <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 shadow-inner">
                                <h4 className="font-serif text-2xl text-primary italic font-bold mb-4">Lo que llevas:</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 pb-4">
                                    {cartItemsList.length === 0 ? (
                                        <p className="text-sm font-bold text-primary/40 text-center py-4 w-full col-span-full">Tu canasta está vacía.</p>
                                    ) : (
                                        cartItemsList.map(item => (
                                            <div key={item.id} className="w-full flex flex-col justify-between bg-white p-5 rounded-[2rem] shadow-sm border border-primary/5 hover:border-primary/20 transition-all">
                                                <div className="mb-4">
                                                    <div className="flex justify-between items-start gap-2 mb-2">
                                                        <p className="font-serif text-xl text-primary italic font-bold leading-tight">{item.name}</p>
                                                        <span className="font-black text-primary text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                    {item.boxSize && (
                                                        <p className="text-[10px] text-primary/60 font-black uppercase tracking-wider mt-1 leading-relaxed">
                                                            {Object.entries(item.selections || {}).filter(([_, q]) => q > 0).map(([n, q]) => `${q}x ${n}`).join(' · ')}
                                                        </p>
                                                    )}
                                                    {!item.boxSize && item.quantity > 1 && (
                                                        <p className="text-[10px] text-primary/60 font-black uppercase tracking-wider mt-1">
                                                            Cantidad: {item.quantity}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-auto flex justify-end">
                                                    <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white border border-red-200 bg-red-50 hover:bg-red-500 rounded-xl px-4 py-2 transition-all w-full flex justify-center items-center gap-2">
                                                        <span>✕</span> Quitar
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="border-t-2 border-primary/10 mt-5 pt-4 flex justify-between items-center">
                                    <span className="text-sm font-black uppercase tracking-widest text-primary/60">Total</span>
                                    <span className="font-serif text-3xl text-primary italic font-bold">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <input className="w-full bg-bg/10 p-7 rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/5 border border-primary/5 font-serif text-xl placeholder:text-primary/20" placeholder="¿A nombre de quién?" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                            <input className="w-full bg-bg/10 p-7 rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/5 border border-primary/5 font-serif text-xl placeholder:text-primary/20" placeholder="Tu Email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
                            <input className="w-full bg-bg/10 p-7 rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/5 border border-primary/5 font-serif text-xl placeholder:text-primary/20" placeholder="Tu WhatsApp" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />

                            {/* Gift Note Toggle */}
                            <div className={`rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${
                                cartGift.is_gift ? 'border-accent bg-accent/5' : 'border-primary/10 bg-white'
                            }`}>
                                <button
                                    type="button"
                                    onClick={() => cartStore.set({ ...cartStore.get(), gift: { ...cartGift, is_gift: !cartGift.is_gift } })}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">🎁</span>
                                        <div>
                                            <p className="font-serif text-xl text-primary italic font-bold">¿Es un regalo?</p>
                                            <p className="text-xs font-black uppercase tracking-widest text-primary/40 mt-0.5">Añadir nota de regalo</p>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${
                                        cartGift.is_gift ? 'bg-accent justify-end' : 'bg-primary/15 justify-start'
                                    }`}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                </button>
                                {cartGift.is_gift && (
                                    <textarea
                                        className="w-full bg-transparent px-6 pb-6 outline-none font-serif text-lg text-primary placeholder:text-primary/30 resize-none"
                                        rows={3}
                                        placeholder="Escribe tu mensaje de regalo aquí..."
                                        value={cartGift.message}
                                        onChange={e => cartStore.set({ ...cartStore.get(), gift: { ...cartGift, message: e.target.value } })}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-8 max-w-lg mx-auto w-full animate-fade-in">
                            <div className="p-10 rounded-[3.5rem] bg-accent/5 border-2 border-accent/10 text-center w-full shadow-inner">
                                <h3 className="font-serif text-4xl text-primary italic mb-6">Pagar vía Transferencia</h3>
                                
                                {/* QR Section */}
                                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-primary/5 flex flex-col items-center gap-4 mb-8">
                                    <div className="w-72 h-72 rounded-2xl overflow-hidden shadow-inner">
                                        <img src="/imagenes/zelle.png" alt="Zelle QR" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Zelle / Venmo</p>
                                        <p className="font-serif text-2xl text-primary italic mt-1">Maria Soto</p>
                                    </div>
                                </div>

                                <p className="text-primary/60 mb-10 leading-relaxed font-serif text-lg">
                                    Escanea el código de arriba en tu app bancaria para completar el pago.
                                </p>
                                
                                <label className="block p-8 rounded-[2.5rem] border-2 border-dashed border-primary/10 cursor-pointer hover:bg-white transition-all group">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-2xl">📎</span>
                                        <span className="font-black text-base uppercase tracking-wider text-primary/40 group-hover:text-primary transition-colors text-center">
                                            {receiptFile ? receiptFile.name : 'Sube tu comprobante (opcional)'}
                                        </span>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => setReceiptFile(e.target.files?.[0] || null)} />
                                </label>
                            </div>
                        </div>
                    )}
                    {orderError && (
                        <div className="max-w-lg mx-auto w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-bold">
                            <p className="font-black mb-1">⚠️ Error al procesar:</p>
                            <p className="font-mono text-xs opacity-80 break-all">{orderError}</p>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-6 mt-8 max-w-lg mx-auto w-full">
                        <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 h-20 rounded-3xl font-black">ATRÁS</Button>
                        <Button disabled={step === 4 && (!customer.name || !customer.email || !customer.phone)} onClick={step === 4 ? () => setStep(5) : handleSubmitOrder} className={`flex-[2] h-20 rounded-3xl font-black shadow-2xl ${isUploading ? 'opacity-50' : ''}`}>
                            {isUploading ? '⏳ Horneando...' : (step === 4 ? 'CONTINUAR' : '¡PEDIR AHORA! 💖')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 6: Success */}
            {step === 6 && (
                <div className="animate-fade-in flex-1 flex flex-col items-center justify-center text-center space-y-12 py-20">
                    <div className="relative">
                        <span className="text-9xl animate-bounce inline-block">🥐</span>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent/5 rounded-full animate-ping pointer-events-none" />
                    </div>
                    <div>
                        <h2 className="font-serif text-6xl md:text-7xl text-primary italic leading-tight mb-6">¡Gracias por<br/>tu pedido!</h2>
                        <p className="text-primary/60 max-w-sm mx-auto font-serif italic text-xl leading-relaxed">Estamos preparando lo mejor de nuestro horno para ti. Revisa tu email.</p>
                    </div>
                    <a href="/" className="w-full max-w-md"><Button className="w-full h-20 text-xl font-black rounded-[2rem] shadow-2xl">REGRESAR AL INICIO</Button></a>
                </div>
            )}
        </div>
    );
};
