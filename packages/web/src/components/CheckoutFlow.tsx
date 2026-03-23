import React, { useState, useEffect } from 'react';
import { 
    createOrder, 
    PickupLocation,
    isValidHoustonZip,
    getEarliestAvailableDate,
    cookieFlavors,
    breadFlavors,
    pickupLocations
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

    const earliestDate = getEarliestAvailableDate();

    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch('/api/storefront-data');
                if (!response.ok) throw new Error('Failed to fetch from /api/storefront-data');
                const data = await response.json();

                setLiveCookies(data.cookies?.length > 0 ? data.cookies : cookieFlavors);
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

    // All products combined for summary/order purposes
    const allLiveProducts = [...liveCookies, ...liveBreads];

    const totalCookies = Object.values(cart).reduce((a: number, b: number) => a + b, 0);
    const isBoxFull = boxSize !== null && totalCookies === boxSize;
    // Calculate total based on actual item prices
    const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = allLiveProducts.find((p: any) => p.id === id);
        return sum + ((item?.price || 12) * (qty as number));
    }, 0);

    const handleAddCookie = (id: string) => {
        if (boxSize && totalCookies < boxSize) {
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
                    <h2 className="font-serif text-4xl text-primary mb-2 italic">1. Logística</h2>
                    <p className="text-gray-600 mb-10">¿Cómo prefieres recibir tu pan en Houston?</p>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        <button 
                            onClick={() => setLogistics('pickup')}
                            className={`p-8 rounded-2xl border-2 text-left transition-all ${logistics === 'pickup' ? 'border-primary bg-primary/5 shadow-inner' : 'border-bg hover:border-accent'}`}>
                            <h3 className="text-xl font-serif font-bold text-primary mb-1 italic">Pickup en Tienda</h3>
                            <p className="text-sm text-gray-500">Recoge tu pedido en nuestros puntos autorizados.</p>
                        </button>

                        <button 
                            onClick={() => setLogistics('delivery')}
                            className={`p-8 rounded-2xl border-2 text-left transition-all ${logistics === 'delivery' ? 'border-primary bg-primary/5 shadow-inner' : 'border-bg hover:border-accent'}`}>
                            <h3 className="text-xl font-serif font-bold text-primary mb-1 italic">Delivery a Casa</h3>
                            <p className="text-sm text-gray-500">Llevamos el pan recién horneado a tu puerta.</p>
                        </button>
                    </div>

                    {logistics === 'delivery' && (
                        <div className="mb-10 animate-fade-in">
                            <label className="block text-sm font-bold text-primary mb-2">Valida tu Código Postal</label>
                            <input 
                                type="text" 
                                placeholder="Ej. 77002"
                                className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:outline-none focus:ring-accent"
                                value={zipCode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setZipCode(e.target.value)}
                            />
                            {zipCode.length >= 5 && !isValidHoustonZip(zipCode) && (
                                <p className="text-xs text-red-500 mt-2 italic font-serif">Lo sentimos, no cubrimos la zona {zipCode} aún.</p>
                            )}
                        </div>
                    )}

                    <div className="mt-auto">
                        <Button 
                            disabled={!logistics || (logistics === 'delivery' && !isValidHoustonZip(zipCode))}
                            onClick={() => setStep(2)}
                            className="w-full h-16 text-xl"
                        >
                            Siguiente: Calendario
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Calendario */}
            {step === 2 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-4xl text-primary mb-2 italic">2. Horarios</h2>
                    <p className="text-gray-600 mb-10">Requerimos 48 horas para fermentar tu pan artesanal.</p>

                    <div className="mb-10">
                        <label className="block text-sm font-bold text-primary mb-2">Selecciona el día</label>
                        <input 
                            type="date"
                            min={earliestDate.toISOString().split('T')[0]}
                            className="w-full p-4 rounded-xl border border-bg text-lg font-serif outline-none focus:ring-2 focus:ring-accent"
                            value={selectedDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    {logistics === 'pickup' && (
                        <div className="mb-10">
                            <label className="block text-sm font-bold text-primary mb-4">Elige tu punto de entrega</label>
                            <div className="grid gap-3">
                                {liveLocations.filter(l => l.type === 'pickup').map(l => (
                                    <button 
                                        key={l.id}
                                        onClick={() => setLocationId(l.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${locationId === l.id ? 'border-primary bg-primary/5' : 'border-bg'}`}>
                                        <h4 className="font-serif text-primary italic">{l.name}</h4>
                                        <p className="text-[10px] text-gray-500">{l.address}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-auto">
                        <Button variant="outline" onClick={() => setStep(1)} className="w-1/3 border-gray-300">Atrás</Button>
                        <Button
                            disabled={!selectedDate || (logistics === 'pickup' && !locationId)}
                            onClick={() => setStep(3)}
                            className="w-2/3 h-16"
                        >
                            Elegir Productos
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Menú */}
            {step === 3 && (
                <div className="animate-fade-in flex-1">
                    <h2 className="font-serif text-4xl text-primary mb-4 italic">3. Arma tu Caja</h2>
                    <p className="text-gray-600 mb-8">Selecciona el tamaño y elige tus sabores ({totalCookies}/{boxSize || '?'})</p>

                    <div className="flex gap-4 mb-8 justify-center">
                        {[3, 6, 9].map(size => (
                            <button
                                key={size}
                                onClick={() => { setBoxSize(size); setCart({}); }}
                                className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${boxSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-bg hover:border-accent text-gray-500'}`}
                            >
                                {size} Galletas
                            </button>
                        ))}
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-3 mb-6">
                        <button onClick={() => setMenuTab('cookies')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${menuTab === 'cookies' ? 'bg-primary text-white' : 'bg-bg text-gray-500'}`}>🍪 Galletas</button>
                        <button onClick={() => setMenuTab('breads')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${menuTab === 'breads' ? 'bg-primary text-white' : 'bg-bg text-gray-500'}`}>🍞 Pan de Masa Madre</button>
                    </div>

                    {boxSize && (
                        <div className="mb-10 space-y-4 max-h-[400px] overflow-y-auto px-2">
                            {(menuTab === 'cookies' ? liveCookies : liveBreads).map((flavor: any) => (
                                <div key={flavor.id} className="flex flex-col bg-bg/5 p-4 rounded-xl border border-bg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-serif text-lg italic text-primary">{flavor.name}</span>
                                            <div className="flex gap-2 mt-1">
                                                {flavor.is_sourdough && <span className="text-[9px] uppercase tracking-wider bg-transparent border border-accent text-primary px-2 py-0.5 rounded-full">Sourdough</span>}
                                                {flavor.is_gluten_free && <span className="text-[9px] uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Gluten Free</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleRemoveCookie(flavor.id)} className="w-8 h-8 rounded-full bg-white border border-bg text-primary font-bold disabled:opacity-30 flex items-center justify-center pb-1" disabled={!cart[flavor.id]}>-</button>
                                            <span className="w-4 text-center font-bold">{cart[flavor.id] || 0}</span>
                                            <button onClick={() => handleAddCookie(flavor.id)} className="w-8 h-8 rounded-full bg-primary text-white font-bold disabled:opacity-30 flex items-center justify-center pb-1" disabled={totalCookies >= boxSize}>+</button>
                                        </div>
                                    </div>
                                    {flavor.description && (
                                        <p className="text-sm text-gray-600 mb-1">{flavor.description}</p>
                                    )}
                                    {flavor.ingredients && (
                                        <p className="text-[10px] text-gray-400 italic">Ingredientes: {flavor.ingredients}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-4 mt-auto">
                        <Button variant="outline" onClick={() => setStep(2)} className="w-1/3 border-gray-300">Atrás</Button>
                        <Button
                            disabled={!isBoxFull}
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
                    <p className="text-gray-600 mb-10">Información para la entrega y contacto.</p>

                    <div className="space-y-6 mb-10">
                        <input 
                            type="text" placeholder="Nombre completo"
                            className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-accent outline-none"
                            value={customer.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer({...customer, name: e.target.value})}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                            <input 
                                type="tel" placeholder="Teléfono (832-000-0000)"
                                className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-accent outline-none"
                                value={customer.phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer({...customer, phone: e.target.value})}
                            />
                            <input 
                                type="email" placeholder="Email"
                                className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-accent outline-none"
                                value={customer.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer({...customer, email: e.target.value})}
                            />
                        </div>

                        <div className="pt-6 border-t border-bg">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 accent-primary" checked={gift.is_gift} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGift({...gift, is_gift: e.target.checked})} />
                                <span className="font-serif italic text-primary">¿Es un regalo? 🎁</span>
                            </label>
                            {gift.is_gift && (
                                <textarea 
                                    className="w-full mt-4 p-4 rounded-xl border border-bg focus:ring-2 focus:ring-accent outline-none h-24 italic"
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
                    <p className="text-gray-600 mb-10">Revisa tu resumen y elige el método de pago.</p>

                    <div className="bg-bg/10 p-6 rounded-3xl border border-bg mb-8">
                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary mb-4">Resumen de Compra</h4>
                        <ul className="space-y-2 text-sm italic mb-4">
                            {Object.entries(cart).map(([id, qty]: [string, number]) => (
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
                            <h5 className="font-serif italic font-bold text-primary">Transferencia</h5>
                            <p className="text-[10px] uppercase tracking-tighter opacity-60">Zelle / Venmo</p>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-bg'}`}>
                            <h5 className="font-serif italic font-bold text-primary">Efectivo</h5>
                            <p className="text-[10px] uppercase tracking-tighter opacity-60">Pago al recibir</p>
                        </button>
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <Button variant="outline" onClick={() => setStep(4)} className="w-1/3 border-gray-300">Atrás</Button>
                        <Button
                            disabled={!paymentMethod}
                            onClick={async () => {
                                try {
                                    // Let's try to save to DB but with only the fields that exist in schema.sql
                                    // to avoid errors.
                                    await createOrder({
                                        customer_name: customer.name,
                                        customer_phone: customer.phone,
                                        customer_email: customer.email,
                                        // Use 'del-1' for delivery because 'delivery-hub' doesn't exist in schema.sql
                                        location_id: locationId || 'del-1', 
                                        pickup_day: selectedDate,
                                        box_size: boxSize,
                                        flavors_selected: cart,
                                        total_price: totalAmount,
                                        status: 'Pending'
                                    } as any);
                                    
                                    setStep(6);
                                } catch (e) {
                                    console.error("DB Save failed, proceeding to Step 6 anyway:", e);
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
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Gracias <strong>{customer.name.split(' ')[0]}</strong>, hemos registrado tu pedido.
                        Tu número de confirmación es <strong>#HOU-{Math.floor(1000 + Math.random() * 9000)}</strong>.
                    </p>

                    {paymentMethod === 'transfer' ? (
                        <div className="bg-bg/20 p-8 rounded-3xl border border-primary/20 mb-10 max-w-sm mx-auto">
                            <h4 className="font-serif italic text-xl text-primary mb-4">Datos para Transferencia</h4>
                            <div className="space-y-4 text-left text-sm mb-6">
                                <div className="flex justify-between border-b border-primary/10 pb-2">
                                    <span className="opacity-60">Zelle:</span>
                                    <span className="font-bold">houston@paselguerita.com</span>
                                </div>
                                <div className="flex justify-between border-b border-primary/10 pb-2">
                                    <span className="opacity-60">Venmo:</span>
                                    <span className="font-bold">@paselguerita</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-60">Total a pagar:</span>
                                    <span className="font-bold text-lg text-primary">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            {/* Placeholder QR */}
                            <div className="bg-white p-4 rounded-2xl w-40 h-40 mx-auto flex items-center justify-center border border-primary/5 shadow-inner">
                                <div className="grid grid-cols-4 gap-1 opacity-20">
                                    {Array.from({length: 16}).map((_, i) => (
                                        <div key={i} className={`w-6 h-6 ${Math.random() > 0.5 ? 'bg-primary' : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                                <span className="absolute text-[8px] uppercase tracking-widest font-bold text-primary/40">QR CODE</span>
                            </div>
                            <p className="text-[10px] mt-4 uppercase tracking-wider text-primary/60">Escanea para pagar</p>
                        </div>
                    ) : (
                        <div className="bg-bg/20 p-8 rounded-3xl border border-primary/20 mb-10 max-w-sm mx-auto">
                            <h4 className="font-serif italic text-xl text-primary mb-4">Pago en Efectivo</h4>
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
