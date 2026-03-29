import React, { useState, useEffect } from 'react';
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
    const [logistics, setLogistics] = useState<'pickup' | 'delivery' | null>(null);
    const [zipCode, setZipCode] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [locationId, setLocationId] = useState('');
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
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
                setLiveLocations(data.locations?.length > 0 ? data.locations : pickupLocations);
            } catch (error) {
                console.error("Failed to load DB data, using fallbacks:", error);
                setLiveLocations(pickupLocations);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const cartItemsList = Object.values(cartItems);
    const totalAmount = cartItemsList.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const isStep2Valid = selectedDate && (locationId === 'special-coordination' || (isWednesdayOrSaturday(selectedDate)));

    const handleBoxSelection = (boxId: string, flavorName: string, delta: number) => {
        const item = cartItems[boxId];
        if (!item || !item.boxSize || !item.selections) return;
        
        const currentTotal = Object.values(item.selections).reduce((a, b) => a + b, 0);
        if (delta > 0 && currentTotal >= item.boxSize) return;
        if (delta < 0 && (item.selections[flavorName] || 0) <= 0) return;

        const newSelections = { ...item.selections };
        newSelections[flavorName] = (newSelections[flavorName] || 0) + delta;
        if (newSelections[flavorName] === 0) delete newSelections[flavorName];

        cartStore.set({
            ...cartStore.get(),
            items: {
                ...cartItems,
                [boxId]: { ...item, selections: newSelections }
            }
        });
    };

    const handleSubmitOrder = async () => {
        setIsUploading(true);
        try {
            const orderData = {
                customer_name: customer.name,
                customer_phone: customer.phone,
                customer_email: customer.email,
                location_id: locationId,
                pickup_day: selectedDate,
                box_size: 0,
                flavors_selected: cartItems,
                total_price: totalAmount,
                status: 'Pendiente',
                notes: `${remarks}${receiptFile ? ' | Pago adjunto' : ''}`,
            };
            await createOrder(orderData);
            setStep(6);
            cartStore.set({ items: {}, gift: { is_gift: false, message: '' }, isOpen: false });
        } catch (e) { alert("Error"); }
        finally { setIsUploading(false); }
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
                        <p className="text-primary/60 font-serif">Elige cómo quieres recibir tu pedido.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                        {['pickup', 'delivery'].map(type => (
                            <button key={type} onClick={() => setLogistics(type as any)} className={`p-10 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-6 group ${logistics === type ? 'border-primary bg-primary/5 shadow-xl' : 'border-primary/5 hover:border-primary/20 bg-bg/20'}`}>
                                <span className="text-5xl group-hover:scale-110 transition-transform">{type === 'pickup' ? '🛍️' : '🚚'}</span>
                                <span className="font-serif text-2xl text-primary italic">{type === 'pickup' ? 'Recoger' : 'Envio'}</span>
                            </button>
                        ))}
                    </div>

                    {logistics === 'pickup' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
                            {liveLocations.map(l => (
                                <button key={l.id} onClick={() => setLocationId(l.id)} className={`p-6 rounded-3xl border-2 text-left transition-all ${locationId === l.id ? 'border-primary bg-white shadow-lg' : 'border-primary/5 bg-bg/5 hover:bg-white'}`}>
                                    <h4 className="font-serif text-lg text-primary">{l.name}</h4>
                                    <p className="text-xs text-primary/40 truncate mt-1">{l.address}</p>
                                    <div className="flex gap-2 mt-4">
                                        {l.days.map(d => <span key={d} className="text-[8px] font-black uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-full">{d.slice(0,3)}</span>)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="pt-10">
                        <Button disabled={!logistics || (logistics === 'pickup' && !locationId)} onClick={() => setStep(2)} className="w-full h-20 text-xl font-black rounded-3xl">SIGUIENTE PASO</Button>
                    </div>
                </div>
            )}

            {/* Step 2: Calendar */}
            {step === 2 && (
                <div className="animate-fade-in space-y-10">
                    <div className="text-center">
                        <h2 className="font-serif text-5xl text-primary italic">¿Cuándo?</h2>
                        <p className="text-primary/40 text-xs font-black uppercase tracking-widest mt-4">Entregas Miércoles y Sábados</p>
                    </div>
                    <div className="max-w-md mx-auto">
                        <CustomCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} minDate={earliestDate} allowedDays={['Wednesday', 'Saturday']} />
                    </div>
                    <div className="flex gap-6 mt-10">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-16 border-primary/20 text-primary/60">ATRÁS</Button>
                        <Button disabled={!isStep2Valid} onClick={() => setStep(3)} className="flex-[2] h-16">ARMAS TU PEDIDO</Button>
                    </div>
                </div>
            )}

            {/* Step 3: Box Builder & Picker (Visual Hero) */}
            {step === 3 && (
                <div className="animate-fade-in space-y-12">
                     <div className="text-center">
                        <h2 className="font-serif text-5xl text-primary italic">Personaliza</h2>
                        <p className="text-primary/60 font-serif">Arma tu caja y añade extras del horno.</p>
                    </div>

                    {/* Boxes in Cart */}
                    {cartItemsList.filter(i => i.boxSize).map(box => {
                        const boxSize = box.boxSize || 3;
                        const filled = Object.values(box.selections || {}).reduce((a, b) => a + b, 0);
                        return (
                            <div key={box.id} className="bg-primary/5 p-8 rounded-[3rem] border border-primary/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full translate-x-8 -translate-y-8" />
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="font-serif text-3xl text-primary italic">Tu Caja de {boxSize}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-accent mt-2">
                                            {filled < boxSize ? `Faltan ${boxSize - filled} galletas` : '¡Caja completa! ✨'}
                                        </p>
                                    </div>
                                    <button onClick={() => removeFromCart(box.id)} className="text-red-400 font-black text-[10px] uppercase hover:underline">Eliminar caja</button>
                                </div>

                                {/* Flavor Picker Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {cookieFlavors.map(f => {
                                        const count = box.selections?.[f.name] || 0;
                                        return (
                                            <div key={f.id} className="bg-white p-4 rounded-[2rem] flex flex-col items-center gap-3 border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="w-16 h-16 rounded-full overflow-hidden border border-primary/10">
                                                    <img src={f.image} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[10px] font-serif italic text-primary text-center leading-tight">{f.name}</span>
                                                <div className="flex items-center gap-4 bg-primary/5 rounded-full px-3 py-1">
                                                    <button onClick={() => handleBoxSelection(box.id, f.name, -1)} className="font-black text-primary">-</button>
                                                    <span className="text-xs font-bold text-primary">{count}</span>
                                                    <button onClick={() => handleBoxSelection(box.id, f.name, 1)} className="font-black text-primary">+</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Fresh from Oven (Quick Add) */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-6 px-2">Añadir algo más del horno</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[...cookieFlavors.slice(0, 2), ...breadFlavors].map(p => (
                                <div key={p.id} className="bg-bg/10 p-4 rounded-[2rem] border border-primary/5 flex items-center gap-6 group hover:bg-white transition-colors cursor-pointer"
                                     onClick={() => addToCart(p)}>
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                        <img src={p.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-serif text-xl text-primary italic leading-tight">{p.name}</p>
                                        <p className="text-xs font-bold text-accent mt-1">${p.price || (p.category === 'bread' ? 18 : 12)}</p>
                                    </div>
                                    <span className="text-2xl text-primary/20 group-hover:text-primary transition-colors">+</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-10 flex gap-6">
                        <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-16">ATRÁS</Button>
                        <Button disabled={cartItemsList.length === 0} onClick={() => setStep(4)} className="flex-[2] h-16 shadow-2xl">CONFIRMAR — ${totalAmount.toFixed(2)}</Button>
                    </div>
                </div>
            )}

            {/* Step 4: Details & Step 5: Payment are similar but refined */}
            {step >= 4 && step <= 5 && (
                <div className="animate-fade-in space-y-12">
                    <div className="text-center">
                        <h2 className="font-serif text-5xl text-primary italic">{step === 4 ? 'Tus Datos' : 'El Pago'}</h2>
                    </div>
                    {step === 4 ? (
                        <div className="space-y-6">
                            <input className="w-full bg-bg/5 p-6 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 border-2 border-primary/5 font-serif text-xl" placeholder="Nombre" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                            <input className="w-full bg-bg/5 p-6 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 border-2 border-primary/5 font-serif text-xl" placeholder="Email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
                            <input className="w-full bg-bg/5 p-6 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 border-2 border-primary/5 font-serif text-xl" placeholder="WhatsApp" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                        </div>
                    ) : (
                        <div className="p-10 rounded-[3rem] bg-accent/5 border-2 border-accent/20 text-center">
                            <h3 className="font-serif text-3xl text-primary italic mb-6">Pagar vía Transferencia</h3>
                            <p className="text-primary/60 max-w-sm mx-auto mb-8">Una vez que finalices, te enviaremos los datos de Zelle/Venmo a tu correo y WhatsApp.</p>
                            <label className="block p-8 rounded-[2rem] border-2 border-dashed border-primary/20 cursor-pointer hover:bg-white transition-colors">
                                <span className="font-black text-[10px] uppercase tracking-widest text-primary/40">{receiptFile ? receiptFile.name : 'Sube tu comprobante (opcional)'}</span>
                                <input type="file" className="hidden" onChange={e => setReceiptFile(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                    )}
                    <div className="flex gap-6 mt-10">
                        <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 h-16">ATRÁS</Button>
                        <Button disabled={step === 4 && (!customer.name || !customer.email || !customer.phone)} onClick={step === 4 ? () => setStep(5) : handleSubmitOrder} className={`flex-[2] h-16 ${isUploading ? 'opacity-50' : ''}`}>
                            {isUploading ? 'HORNENADO...' : (step === 4 ? 'CONTINUAR' : '¡PEDIR AHORA! 💖')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 6: Success */}
            {step === 6 && (
                <div className="animate-fade-in flex-1 flex flex-col items-center justify-center text-center space-y-10 py-20">
                    <span className="text-8xl animate-bounce">🥐</span>
                    <h2 className="font-serif text-6xl text-primary italic leading-tight">¡Gracias por<br/>tu pedido!</h2>
                    <p className="text-primary/60 max-w-xs font-serif italic text-lg line-clamp-2">Te hemos enviado todos los detalles a tu email. ¡Prepárate para el mejor pan!</p>
                    <a href="/" className="w-full max-w-sm"><Button className="w-full h-20 text-xl font-black rounded-3xl shadow-2xl">REGRESAR AL INICIO</Button></a>
                </div>
            )}
        </div>
    );
};
