import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartStore } from '../stores/cartStore';
import { 
    createOrder, 
    PickupLocation,
    isValidHoustonZip,
    getEarliestAvailableDate,
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

    // Date Logic helpers
    const isDateValid = isWednesdayOrSaturday(selectedDate);
    const selectedDayName = selectedDate ? new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long' }) : '';

    const doesDateMatchLocation = (dateStr: string, locId: string) => {
        const loc = liveLocations.find(l => l.id === locId);
        if (!loc || !dateStr) return true;
        const day = new Date(dateStr.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long' });
        const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
        return (loc.days as string[]).includes(capitalizedDay);
    };

    const isStep2Valid = selectedDate && (locationId === 'special-coordination' || (isDateValid && doesDateMatchLocation(selectedDate, locationId)));

    const cartItemsList = Object.values(cartItems);
    const totalAmount = cartItemsList.reduce((acc, item) => {
        let itemTotal = item.price * item.quantity;
        if (item.category === 'bread' && slicedBreads[item.id]) {
            itemTotal += slicedBreads[item.id] * 1;
        }
        return acc + itemTotal;
    }, 0);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleSubmitOrder = async () => {
        setIsUploading(true);
        try {
            let receiptUrl = '';
            if (receiptFile) {
                const formData = new FormData();
                formData.append('file', receiptFile);
                const uploadRes = await fetch('/api/upload-receipt', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
                receiptUrl = uploadData.url;
            }

            const orderData = {
                customer_name: customer.name,
                customer_phone: customer.phone,
                customer_email: customer.email,
                location_id: locationId,
                pickup_day: selectedDate,
                box_size: 0, // No longer using fixed box sizes strictly
                flavors_selected: cartItems,
                sliced_breads: slicedBreads,
                total_price: totalAmount,
                status: 'Pendiente',
                notes: `${remarks}${receiptUrl ? ` | Comprobante: ${receiptUrl}` : ''}`,
                email: customer.email,
                phone: customer.phone
            };

            await createOrder(orderData);
            setStep(6); // Success
            cartStore.set({
                items: {},
                gift: { is_gift: false, message: '' },
                isOpen: false
            }); // Clear cart
        } catch (e) {
            console.error(e);
            alert("Error al procesar tu pedido. Por favor intenta de nuevo.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-20 animate-pulse text-primary font-serif italic text-2xl">Calentando los hornos...</div>;
    }

    const steps = ["Logística", "Fecha", "Revisión", "Detalles", "Pago"];

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl mt-12 border border-bg min-h-[600px] flex flex-col">
            {/* Stepper Header */}
            <div className="flex justify-between mb-12">
                {steps.map((label, i) => (
                    <div key={label} className="flex-1 mx-1 flex flex-col items-center">
                        <div className={`h-2 w-full rounded-full mb-2 ${step >= i + 1 ? 'bg-primary' : 'bg-bg'}`} />
                        <span className={`text-[8px] uppercase font-extrabold tracking-widest ${step === i + 1 ? 'text-primary' : 'text-gray-300'}`}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Logística */}
            {step === 1 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-4xl text-primary mb-2 italic">1. Logística</h2>
                    <p className="text-gray-600 mb-10 font-serif">¿Cómo prefieres recibir tu pan fresco?</p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-10">
                        <button 
                            onClick={() => setLogistics('pickup')}
                            className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${logistics === 'pickup' ? 'border-primary bg-primary/5 shadow-inner' : 'border-bg hover:border-primary/20 bg-white'}`}
                        >
                            <span className="text-4xl text-primary">🛍️</span>
                            <span className="font-serif text-xl text-primary italic">Recoger</span>
                        </button>
                        <button 
                            onClick={() => setLogistics('delivery')}
                            className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${logistics === 'delivery' ? 'border-primary bg-primary/5 shadow-inner' : 'border-bg hover:border-primary/20 bg-white'}`}
                        >
                            <span className="text-4xl text-primary">🚚</span>
                            <span className="font-serif text-xl text-primary italic">A domicilio</span>
                        </button>
                    </div>

                    {logistics === 'delivery' && (
                        <div className="animate-slide-up bg-white p-8 rounded-3xl border border-primary/10 shadow-sm mb-10">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-primary mb-4 italic">Verificar cobertura (Zip Code)</label>
                            <div className="flex gap-4">
                                <input 
                                    className="flex-1 bg-bg p-5 rounded-2xl text-xl font-serif outline-none border-2 border-transparent focus:border-accent transition-all"
                                    placeholder="Ej. 75204"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                />
                                {isValidHoustonZip(zipCode) && (
                                    <div className="flex items-center gap-2 px-6 bg-green-50 text-green-700 font-bold rounded-2xl animate-bounce">
                                        ✨ ¡Tenemos cobertura!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {logistics === 'pickup' && (
                        <div className="animate-slide-up space-y-4 mb-10">
                            {['pos', 'pickup'].map(type => {
                                const typeLocations = liveLocations.filter(l => l.type === type);
                                if (typeLocations.length === 0) return null;
                                return (
                                    <div key={type}>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mb-3 px-2">{type === 'pos' ? 'Puntos de Venta (Mercados)' : 'Puntos de Recolección'}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {typeLocations.map(l => (
                                                <button 
                                                    key={l.id}
                                                    onClick={() => setLocationId(l.id)}
                                                    className={`p-6 rounded-2xl text-left border-2 transition-all group ${locationId === l.id ? 'border-primary bg-primary/5 shadow-md' : 'border-bg hover:border-primary/10 bg-white'}`}
                                                >
                                                    <div className="flex flex-col">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-serif text-lg text-primary">{l.name}</h4>
                                                            {l.isSoldOut && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sold Out</span>}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2 truncate">{l.address}</p>
                                                        <div className="flex gap-3">
                                                            <span className="text-[10px] font-bold text-primary opacity-60">📅 {l.days.join(' & ')}</span>
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
                            disabled={!logistics || (logistics === 'pickup' && !locationId) || (logistics === 'delivery' && !isValidHoustonZip(zipCode))}
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

                    <div className="mb-8 max-w-md mx-auto">
                        <CustomCalendar 
                            selectedDate={selectedDate}
                            onDateSelect={(date) => setSelectedDate(date)}
                            minDate={earliestDate}
                            allowedDays={['Wednesday', 'Saturday']}
                        />
                        {selectedDate && !isStep2Valid && (
                            <p className="text-red-500 text-[10px] mt-4 font-bold uppercase tracking-widest text-center italic animate-pulse">
                                📍 Esta ubicación no abre el día seleccionado.
                            </p>
                        )}
                    </div>

                    <div className="mt-auto flex gap-4">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14">Atrás</Button>
                        <Button
                            disabled={!isStep2Valid}
                            onClick={() => setStep(3)}
                            className="flex-[2] h-14"
                        >
                            Ver Resumen
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Resumen de Pedido */}
            {step === 3 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-4xl text-primary mb-2 italic">3. Tu Carrito</h2>
                    <p className="text-gray-600 mb-10 font-serif">Revisa los productos en tu bolsa.</p>

                    <div className="space-y-4 mb-10">
                        {cartItemsList.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-bg/20 p-4 rounded-2xl border border-primary/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-primary">
                                        {item.quantity}x
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary">{item.name}</p>
                                        <p className="text-[10px] text-gray-500 italic uppercase tracking-widest">{item.flavor}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {cartGift.is_gift && (
                        <div className="bg-accent/5 p-6 rounded-3xl border border-accent/20 mb-10 italic">
                            <p className="text-[10px] font-black uppercase text-accent mb-2">🎁 Mensaje de Regalo</p>
                            <p className="text-primary font-serif">"{cartGift.message}"</p>
                        </div>
                    )}

                    <div className="mt-auto flex gap-4">
                        <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-14">Atrás</Button>
                        <Button
                            disabled={cartItemsList.length === 0}
                            onClick={() => setStep(4)}
                            className="flex-[2] h-14 shadow-xl"
                        >
                            Confirmar Datos — ${totalAmount.toFixed(2)}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Detalles de Entrega */}
            {step === 4 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-4xl text-primary mb-2 italic">4. Tus Datos</h2>
                    <p className="text-gray-600 mb-10 font-serif">¿A dónde enviamos el recibo?</p>
                    
                    <div className="space-y-6 mb-10">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Nombre Completo</label>
                                <input className="w-full bg-bg p-5 rounded-2xl outline-none focus:ring-2 focus:ring-accent border-2 border-transparent transition-all font-serif" 
                                    value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Teléfono (WhatsApp)</label>
                                <input className="w-full bg-bg p-5 rounded-2xl outline-none focus:ring-2 focus:ring-accent border-2 border-transparent transition-all font-serif" 
                                    value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Correo Electrónico</label>
                            <input className="w-full bg-bg p-5 rounded-2xl outline-none focus:ring-2 focus:ring-accent border-2 border-transparent transition-all font-serif" 
                                value={customer.email} onChange={(e) => setCustomer({...customer, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Instrucciones especiales</label>
                            <textarea className="w-full bg-bg p-5 rounded-2xl outline-none focus:ring-2 focus:ring-accent border-2 border-transparent transition-all font-serif h-32" 
                                placeholder="Ej: Es para un cumpleaños, dejar en portería, etc."
                                value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                    </div>

                    <div className="mt-auto flex gap-4">
                        <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-14">Atrás</Button>
                        <Button
                            disabled={!customer.name || !customer.phone || !customer.email}
                            onClick={() => setStep(5)}
                            className="flex-[2] h-14"
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
                    <p className="text-gray-600 mb-8 font-serif">Selecciona tu método de pago para procesar el pedido.</p>

                    <div className="space-y-4 mb-10">
                        <div className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-bg'}`}
                            onClick={() => setPaymentMethod('transfer')}>
                            <div>
                                <h4 className="font-bold text-primary">Transferencia Zelle / Venmo</h4>
                                <p className="text-xs text-gray-500">Recibirás los datos al confirmar.</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 ${paymentMethod === 'transfer' ? 'border-primary bg-primary' : 'border-gray-200'}`} />
                        </div>
                    </div>

                    {paymentMethod === 'transfer' && (
                        <div className="animate-slide-up bg-accent/5 p-8 rounded-[2rem] border border-accent/20 mb-10 relative overflow-hidden">
                            <h4 className="font-serif text-2xl text-primary mb-4 italic">Sube tu comprobante</h4>
                            <p className="text-sm text-gray-600 mb-6 font-sans">Para agilizar tu pedido, puedes subir una captura de pantalla de tu transferencia ahora.</p>
                            
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-accent/30 rounded-2xl cursor-pointer hover:bg-accent/10 transition-colors">
                                <span className="text-xs font-black uppercase tracking-widest text-accent">{receiptFile ? receiptFile.name : 'Seleccionar Archivo (Click aquí)'}</span>
                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                            </label>
                        </div>
                    )}

                    <div className="mt-auto flex gap-4">
                        <Button variant="outline" onClick={() => setStep(4)} className="flex-1 h-14">Atrás</Button>
                        <Button
                            disabled={!paymentMethod || isUploading}
                            onClick={handleSubmitOrder}
                            className={`flex-[2] h-14 shadow-2xl ${isUploading ? 'opacity-50' : 'animate-pulse-slow'}`}
                        >
                            {isUploading ? 'Procesando...' : '¡Pagar y Hornear! 🍪'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Success Step */}
            {step === 6 && (
                <div className="animate-fade-in flex-1 flex flex-col items-center justify-center text-center py-10">
                    <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-6xl mb-8 animate-bounce">✨</div>
                    <h2 className="font-serif text-5xl text-primary mb-4 italic">¡Pedido Recibido!</h2>
                    <p className="text-xl text-gray-600 font-serif max-w-sm mb-12">Gracias por elegir Pásele Güerita. Recibirás una confirmación por WhatsApp en breve.</p>
                    <a href="/"><Button className="px-12 h-16 text-xl">Regresar al Inicio</Button></a>
                </div>
            )}
        </div>
    );
};
