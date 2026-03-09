import React, { useState } from 'react';
import { pickupLocations } from '@pasele-guerita/core';
import { Button } from '@pasele-guerita/ui';

export const CheckoutFlow: React.FC = () => {
    const [step, setStep] = useState(1);
    const [selection, setSelection] = useState({ locationId: '', day: '' });
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
    const [fileUploaded, setFileUploaded] = useState(false);

    const selectedLocation = pickupLocations.find(l => l.id === selection.locationId);

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl mt-12 border border-bg">
            <div className="flex justify-between mb-12">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-2 flex-1 mx-2 rounded-full ${step >= i ? 'bg-primary' : 'bg-bg'}`} />
                ))}
            </div>

            {step === 1 && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-4xl text-primary mb-8 italic">Paso 1: ¿Cuándo y dónde?</h2>
                        {pickupLocations.map(loc => {
                            const isSoldOut = loc.isSoldOut;
                            const isSelected = selection.locationId === loc.id;
                            
                            return (
                                <div
                                    key={loc.id}
                                    onClick={() => !isSoldOut && setSelection({ ...selection, locationId: loc.id, day: loc.days[0] })}
                                    className={`p-6 rounded-2xl border-2 transition-all relative ${
                                        isSoldOut ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' :
                                        isSelected ? 'border-primary bg-primary/5 shadow-inner cursor-pointer' :
                                        'border-bg hover:border-accent cursor-pointer'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-serif text-xl font-bold">{loc.name}</h4>
                                        {isSoldOut && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full uppercase">Sold Out</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{loc.address}</p>
                                    <p className={`text-xs font-bold ${isSoldOut ? 'text-gray-400' : 'text-accent'}`}>
                                        {loc.days.join(' & ')} | {loc.hours}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    <Button
                        disabled={!selection.locationId}
                        onClick={() => setStep(2)}
                        className="w-full h-16 text-xl"
                    >
                        Continuar
                    </Button>
                </div>
    )
}

{
    step === 2 && (
        <div className="animate-fade-in">
            <h2 className="font-serif text-4xl text-primary mb-8 italic">Paso 2: Tus datos</h2>
            <div className="space-y-6 mb-10">
                <input
                    type="text" placeholder="Nombre completo"
                    className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-primary outline-none h-14"
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                />
                <input
                    type="tel" placeholder="Teléfono"
                    className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-primary outline-none h-14"
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                />
                <input
                    type="email" placeholder="Email"
                    className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-primary outline-none h-14"
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
            </div>
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Atrás</Button>
                <Button
                    disabled={!customer.name || !customer.phone}
                    onClick={() => setStep(3)}
                    className="flex-[2]"
                >
                    Ver Datos de Pago
                </Button>
            </div>
        </div>
    )
}

{
    step === 3 && (
        <div className="animate-fade-in text-center">
            <h2 className="font-serif text-4xl text-primary mb-6 italic">Paso 3: Pago por Transferencia</h2>
            <p className="text-gray-600 mb-10 text-lg">Realiza tu transferencia y sube el comprobante para confirmar.</p>

            <div className="bg-bg p-8 rounded-3xl mb-10 inline-block text-left w-full max-w-md">
                <p className="font-bold text-primary mb-2">Datos de Cuenta:</p>
                <p className="text-gray-700">Banco: Chase Bank</p>
                <p className="text-gray-700">Nombre: Fernando Sourdough</p>
                <p className="text-gray-700">Cuenta: 1234 5678 9012</p>
                <div className="mt-6 flex justify-center">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-bg flex items-center justify-center">
                        <span className="text-primary font-bold">QR CODE MOCKUP</span>
                        <div className="w-32 h-32 bg-gray-200 ml-4 rounded-lg flex items-center justify-center text-xs text-gray-400">QR Code</div>
                    </div>
                </div>
            </div>

            <div className="mb-10 text-left">
                <label className="block font-bold text-primary mb-4">Comprobante de Pago:</label>
                <input
                    type="file"
                    onChange={() => setFileUploaded(true)}
                    className="w-full p-4 border-2 border-dashed border-bg rounded-2xl cursor-pointer hover:border-primary transition-colors"
                />
            </div>

            <Button
                disabled={!fileUploaded}
                onClick={() => setStep(4)}
                className="w-full h-16 text-xl"
            >
                Confirmar Pedido
            </Button>
        </div>
    )
}

{
    step === 4 && (
        <div className="text-center py-12 animate-fade-in">
            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-xl">✓</div>
            <h2 className="font-serif text-5xl text-primary mb-6 italic">¡Pedido Recibido!</h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto mb-10">
                Gracias {customer.name}, hemos recibido tu pedido para el {selection.day} en {selectedLocation?.name}.
                <span className="block mt-4 font-bold text-primary italic">Validaremos tu pago para confirmar la entrega.</span>
            </p>
            <a href="/"><Button variant="outline">Volver al Inicio</Button></a>
        </div>
    )
}
        </div >
    );
};
