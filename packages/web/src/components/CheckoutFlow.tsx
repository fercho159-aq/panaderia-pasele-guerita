import React, { useState } from 'react';
import { pickupLocations, cookieFlavors, calculateCookiePrice } from '@pasele-guerita/core';
import { Button } from '@pasele-guerita/ui';

export const CheckoutFlow: React.FC = () => {
    const [step, setStep] = useState(1);
    const [boxSize, setBoxSize] = useState<number | null>(null);
    const [cart, setCart] = useState<Record<string, number>>({});
    const [pickupDay, setPickupDay] = useState<'Wednesday' | 'Saturday' | null>(null);
    const [locationId, setLocationId] = useState('');
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
    const [fileUploaded, setFileUploaded] = useState(false);

    const selectedLocation = pickupLocations.find(l => l.id === locationId);
    const totalCookies = Object.values(cart).reduce((a, b) => a + b, 0);
    const isBoxFull = boxSize !== null && totalCookies === boxSize;

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

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl mt-12 border border-bg">
            <div className="flex justify-between mb-12">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-2 flex-1 mx-2 rounded-full ${step >= i ? 'bg-primary' : 'bg-bg'}`} />
                ))}
            </div>

            {/* Step 1: Armar Caja */}
            {step === 1 && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-4xl text-primary mb-6 italic">Paso 1: Arma tu Caja</h2>
                    <p className="text-gray-600 mb-8 text-lg">Selecciona cuántas galletas quieres (Descuento especial de $3.50 por unidad en cajas de 9+)</p>

                    <div className="flex gap-4 mb-10 justify-center flex-wrap">
                        {[3, 6, 9].map(size => (
                            <button
                                key={size}
                                onClick={() => { setBoxSize(size); setCart({}); }}
                                className={`px-8 py-4 rounded-2xl border-2 font-bold text-xl transition-all ${boxSize === size ? 'border-primary bg-primary/10 text-primary shadow-inner' : 'border-bg hover:border-accent text-gray-500'
                                    }`}
                            >
                                Caja de {size}
                            </button>
                        ))}
                    </div>

                    {boxSize && (
                        <div className="mb-10 bg-bg p-6 rounded-2xl border border-accent/20">
                            <h3 className="font-bold text-center mb-6 text-primary">Mix & Match: Elige tus Sabores ({totalCookies}/{boxSize})</h3>
                            <div className="space-y-4">
                                {cookieFlavors.map(flavor => (
                                    <div key={flavor.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                        <span className="font-serif text-lg">{flavor.name}</span>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleRemoveCookie(flavor.id)}
                                                disabled={!cart[flavor.id]}
                                                className="w-10 h-10 rounded-full bg-bg text-primary font-bold disabled:opacity-50 text-xl"
                                            >-</button>
                                            <span className="w-6 text-center font-bold text-xl">{cart[flavor.id] || 0}</span>
                                            <button
                                                onClick={() => handleAddCookie(flavor.id)}
                                                disabled={totalCookies >= boxSize}
                                                className="w-10 h-10 rounded-full bg-primary text-white font-bold disabled:opacity-50 text-xl"
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        disabled={!isBoxFull}
                        onClick={() => setStep(2)}
                        className="w-full h-16 text-xl"
                    >
                        Siguiente (Total: ${boxSize ? calculateCookiePrice(boxSize).toFixed(2) : '0.00'})
                    </Button>
                </div>
            )}

            {/* Step 2: Elegir Día */}
            {step === 2 && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-4xl text-primary mb-8 italic">Paso 2: ¿Cuándo?</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {['Wednesday', 'Saturday'].map(day => (
                            <button
                                key={day}
                                onClick={() => { setPickupDay(day as any); setStep(3); setLocationId(''); }}
                                className={`p-8 rounded-2xl border-2 font-serif text-3xl font-bold transition-all text-center
                                    ${pickupDay === day ? 'border-primary bg-primary/5 text-primary shadow-inner' : 'border-bg hover:border-accent text-gray-600'}`}
                            >
                                {day === 'Wednesday' ? 'Miércoles' : 'Sábado'}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" onClick={() => setStep(1)} className="w-full border-gray-300">Atrás a Mix & Match</Button>
                </div>
            )}

            {/* Step 3: Elegir Locación (Filtrada por día) */}
            {step === 3 && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-4xl text-primary mb-8 italic">Paso 3: ¿Dónde? ({pickupDay === 'Wednesday' ? 'Miércoles' : 'Sábado'})</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {pickupLocations.filter(loc => loc.days.includes(pickupDay as any)).map(loc => {
                            const isSoldOut = loc.isSoldOut;
                            const isSelected = locationId === loc.id;

                            // Translating type
                            const typeLabel = loc.type === 'pos' ? 'Pop-up' : loc.type === 'pickup' ? 'Pick-up' : 'Delivery';

                            return (
                                <div
                                    key={loc.id}
                                    onClick={() => !isSoldOut && setLocationId(loc.id)}
                                    className={`p-6 rounded-2xl border-2 transition-all relative ${isSoldOut ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' :
                                            isSelected ? 'border-primary bg-primary/5 shadow-inner cursor-pointer' :
                                                'border-bg hover:border-accent cursor-pointer'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-serif text-xl font-bold">
                                            <span className="inline-block text-[10px] uppercase font-sans tracking-wide text-primary mr-2 bg-primary/10 px-2 py-1 rounded align-middle">
                                                {typeLabel}
                                            </span>
                                            <span className="align-middle">{loc.name.replace(' (POS)', '').replace(' (Pickup)', '').replace(' (Delivery)', '')}</span>
                                        </h4>
                                        {isSoldOut && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full uppercase ml-2 whitespace-nowrap">Sold Out</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{loc.address}</p>
                                    <p className={`text-xs font-bold ${isSoldOut ? 'text-gray-400' : 'text-accent'}`}>
                                        {loc.hours}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-4 flex-col sm:flex-row">
                        <Button variant="outline" onClick={() => setStep(2)} className="w-full sm:w-1/3 border-gray-300">Cambiar Día</Button>
                        <Button
                            disabled={!locationId}
                            onClick={() => setStep(4)}
                            className="w-full sm:w-2/3 h-14"
                        >
                            Continuar a tus Datos
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Tus Datos */}
            {step === 4 && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-4xl text-primary mb-8 italic">Paso 4: Tus Datos</h2>
                    <div className="space-y-6 mb-10">
                        <input
                            type="text" placeholder="Nombre completo"
                            className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-primary outline-none h-14"
                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                            value={customer.name}
                        />
                        <input
                            type="tel" placeholder="Teléfono"
                            className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-primary outline-none h-14"
                            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                            value={customer.phone}
                        />
                        <input
                            type="email" placeholder="Email"
                            className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-primary outline-none h-14"
                            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                            value={customer.email}
                        />
                    </div>
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <Button variant="outline" onClick={() => setStep(3)} className="w-full sm:w-1/3 border-gray-300">Elegir Locación</Button>
                        <Button
                            disabled={!customer.name || !customer.phone}
                            onClick={() => setStep(5)}
                            className="w-full sm:w-2/3 h-14"
                        >
                            Ver Datos de Pago
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 5: Pago */}
            {step === 5 && (
                <div className="animate-fade-in text-center">
                    <h2 className="font-serif text-4xl text-primary mb-6 italic">Paso 5: Pago por Transferencia</h2>
                    <p className="text-gray-600 mb-6 text-lg">
                        Total a pagar: <strong className="text-2xl text-primary">${boxSize ? calculateCookiePrice(boxSize).toFixed(2) : '0.00'}</strong>
                        <br /><span className="text-sm">Por {boxSize} galletas para pick-up en {selectedLocation?.name.split(' (')[0]}.</span>
                    </p>

                    <div className="bg-bg p-8 rounded-3xl mb-10 inline-block text-left w-full max-w-md">
                        <p className="font-bold text-primary mb-2">Datos de Cuenta:</p>
                        <p className="text-gray-700">Banco: Chase Bank</p>
                        <p className="text-gray-700">Nombre: Fernando Sourdough</p>
                        <p className="text-gray-700">Cuenta: 1234 5678 9012</p>
                        <div className="mt-6 flex justify-center">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-bg flex items-center justify-center">
                                <span className="text-primary font-bold text-center">QR ZELLE<br />MOCKUP</span>
                                <div className="w-24 h-24 bg-gray-200 ml-4 rounded-lg flex items-center justify-center text-xs text-gray-400">QR Code</div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10 text-left max-w-md mx-auto">
                        <label className="block font-bold text-primary mb-4">Sube tu Comprobante de Pago:</label>
                        <input
                            type="file"
                            onChange={() => setFileUploaded(true)}
                            className="w-full p-4 border-2 border-dashed border-bg rounded-2xl cursor-pointer hover:border-primary transition-colors focus:outline-none bg-white"
                        />
                    </div>

                    <div className="flex gap-4 flex-col-reverse sm:flex-row max-w-md mx-auto mt-8">
                        <Button variant="outline" onClick={() => setStep(4)} className="w-full sm:w-1/3 border-gray-300">Tus Datos</Button>
                        <Button
                            disabled={!fileUploaded}
                            onClick={() => setStep(6)}
                            className="w-full sm:w-2/3 h-16 text-xl"
                        >
                            Confirmar Pedido
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 6: Success */}
            {step === 6 && (
                <div className="text-center py-12 animate-fade-in">
                    <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-xl">✓</div>
                    <h2 className="font-serif text-5xl text-primary mb-6 italic">¡Pedido Recibido!</h2>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto mb-6">
                        Gracias {customer.name}, hemos recibido tu pedido por {boxSize} galletas.
                    </p>
                    <div className="bg-bg rounded-2xl p-6 md:p-8 inline-block text-left mb-10 border border-primary/20 w-full max-w-md">
                        <p className="font-bold text-primary mb-4 text-xl border-b border-primary/10 pb-2">Detalles de Entrega:</p>
                        <p className="text-gray-700 text-lg mb-2">🗓️ {pickupDay === 'Wednesday' ? 'Miércoles' : 'Sábado'}</p>
                        <p className="text-gray-700 text-lg mb-2">📍 {selectedLocation?.name.split(' (')[0]}</p>
                        <p className="text-gray-700 text-sm opacity-80 pl-6">{selectedLocation?.hours}</p>
                    </div>

                    <p className="block mb-10 font-bold text-primary italic max-w-sm mx-auto">
                        Revisaremos tu comprobante y te enviaremos la confirmación oficial.
                    </p>

                    <a href="/"><Button variant="outline" className="w-full max-w-xs border-gray-300">Volver al Inicio</Button></a>
                </div>
            )}
        </div>
    );
};
