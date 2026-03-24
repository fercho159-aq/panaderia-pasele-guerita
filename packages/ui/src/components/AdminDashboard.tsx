import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface Flavor { id: string; name: string; active: boolean; stock: number; }
interface Location { id: string; name: string; days: string[]; is_sold_out: boolean; type: string; }
interface Order { id: string; customer_name: string; box_size: number; total_price: number; created_at: string; status: string; flavors_selected: Record<string, number>; sliced_breads?: Record<string, number>; }

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
    const [flavors, setFlavors] = useState<Flavor[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [flavorsRes, locationsRes, ordersRes] = await Promise.all([
                fetch('/api/admin/data?type=flavors'),
                fetch('/api/admin/data?type=locations'),
                fetch('/api/admin/data?type=orders')
            ]);

            setFlavors(await flavorsRes.json());
            setLocations(await locationsRes.json());
            setOrders(await ordersRes.json());
        } catch (e) {
            console.error(e);
            alert("Error cargando base de datos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleFlavor = async (id: string, currentStatus: boolean) => {
        setFlavors(flavors.map(f => f.id === id ? { ...f, active: !currentStatus } : f));
        await fetch('/api/admin/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'flavor', id, status: !currentStatus })
        });
    };

    const toggleLocation = async (id: string, currentStatus: boolean) => {
        setLocations(locations.map(l => l.id === id ? { ...l, is_sold_out: !currentStatus } : l));
        await fetch('/api/admin/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'location', id, status: !currentStatus })
        });
    };

    const updateOrderStatus = async (id: string, newStatus: string) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        await fetch('/api/admin/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'order', id, status: newStatus })
        });
    };

    if (isLoading) return <div className="p-20 text-center text-primary font-serif italic text-2xl">Cargando Panel Secreto...</div>;

    return (
        <div className="min-h-screen bg-bg p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-14 md:h-16 w-auto drop-shadow-sm" />
                        <div>
                            <h1 className="font-serif text-3xl md:text-4xl text-primary italic">Panel de Control</h1>
                            <p className="text-gray-500 mt-1 text-sm md:text-base">Pásele Güerita - Centro de Operaciones</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => { document.cookie = "admin_token=; path=/; max-age=0"; window.location.href = "/admin/login"; }}>
                        Cerrar Sesión
                    </Button>
                </div>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Inventario & Logística
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Ventas & Pedidos
                    </button>
                </div>

                {activeTab === 'inventory' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Sabores */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="font-serif text-2xl text-primary mb-6 border-b border-gray-100 pb-4">Catálogo de Productos</h2>
                            <div className="space-y-8">
                                {/* Galletas */}
                                <div>
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-pink-400 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> Galletas Artesanales
                                    </h3>
                                    <div className="space-y-3">
                                        {flavors.filter(f => !f.id.includes('hogaza') && !f.id.includes('pan-') && !f.id.includes('multigrano')).map(flavor => (
                                            <div key={flavor.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <span className="font-bold">{flavor.name}</span>
                                                <button
                                                    onClick={() => toggleFlavor(flavor.id, flavor.active)}
                                                    className={`px-5 py-1.5 rounded-full font-bold text-xs transition-colors ${flavor.active ? 'bg-pink-100 text-pink-700' : 'bg-gray-200 text-gray-400'}`}
                                                >
                                                    {flavor.active ? 'Disponible' : 'Apagado'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Panes */}
                                <div>
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-amber-500 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pan de Masa Madre
                                    </h3>
                                    <div className="space-y-3">
                                        {flavors.filter(f => f.id.includes('hogaza') || f.id.includes('pan-') || f.id.includes('multigrano')).map(flavor => (
                                            <div key={flavor.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <span className="font-bold">{flavor.name}</span>
                                                <button
                                                    onClick={() => toggleFlavor(flavor.id, flavor.active)}
                                                    className={`px-5 py-1.5 rounded-full font-bold text-xs transition-colors ${flavor.active ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-400'}`}
                                                >
                                                    {flavor.active ? 'Disponible' : 'Apagado'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Locaciones */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="font-serif text-2xl text-primary mb-6 border-b border-gray-100 pb-4">Logística y Cierres</h2>
                            <div className="space-y-4">
                                {locations.map(loc => (
                                    <div key={loc.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-bold">{loc.name}</p>
                                            <p className="text-xs text-gray-500">{loc.days.join(' & ')} - {loc.type}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleLocation(loc.id, loc.is_sold_out)}
                                            className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${!loc.is_sold_out ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                        >
                                            {!loc.is_sold_out ? 'Abierto' : 'Sold Out (Cerrado)'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="font-serif text-2xl text-primary mb-6 border-b border-gray-100 pb-4">Últimos Pedidos</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-400 text-sm uppercase">
                                        <th className="pb-4 font-normal min-w-[150px]">Cliente</th>
                                        <th className="pb-4 font-normal min-w-[120px]">Pedido</th>
                                        <th className="pb-4 font-normal min-w-[120px]">Entrega</th>
                                        <th className="pb-4 font-normal min-w-[250px]">Detalle de Productos</th>
                                        <th className="pb-4 font-normal">Total</th>
                                        <th className="pb-4 font-normal">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr><td colSpan={6} className="py-8 text-center text-gray-400 italic">Aún no hay pedidos en la base de datos.</td></tr>
                                    ) : (
                                        orders.map(order => (
                                            <tr key={order.id} className="border-t border-gray-50 align-top">
                                                <td className="py-4 pr-4">
                                                    <div className="font-bold">{order.customer_name}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">#{order.id.slice(0, 8)}</div>
                                                </td>
                                                <td className="py-4 text-gray-500 text-sm">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4">
                                                    <div className="bg-primary/5 text-primary font-bold px-3 py-1 rounded-lg inline-block border border-primary/10">
                                                        {(order as any).pickup_day || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {order.flavors_selected ? 
                                                            Object.entries(order.flavors_selected).map(([f_id, qty]) => {
                                                                const flavor = flavors.find(f => f.id === f_id);
                                                                const isBread = f_id.includes('hogaza') || f_id.includes('pan-') || f_id.includes('multigrano');
                                                                return (
                                                                    <div key={f_id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isBread ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-pink-50 border-pink-100 text-pink-700'}`}>
                                                                        <span className="font-black text-xs bg-white/50 w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{qty}</span>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-bold whitespace-nowrap">{flavor?.name || f_id}</span>
                                                                            {order.sliced_breads?.[f_id] ? (
                                                                                <span className="text-[8px] font-black uppercase text-amber-600 leading-none mt-0.5">✂️ Rebanar ({order.sliced_breads[f_id]})</span>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }) 
                                                            : <span className="text-gray-400 italic text-sm">Sin detalles</span>
                                                        }
                                                    </div>
                                                    <div className="mt-2 text-[10px] font-bold uppercase tracking-widest opacity-30">
                                                        {(() => {
                                                            const ids = Object.keys(order.flavors_selected || {});
                                                            const breadIds = flavors.filter(f => f.id.includes('hogaza') || f.id.includes('pan-') || f.id.includes('multigrano')).map(f => f.id);
                                                            const anyBread = ids.some(id => breadIds.includes(id));
                                                            const anyCookie = ids.some(id => !breadIds.includes(id));
                                                            if (anyBread && anyCookie) return 'Mixto';
                                                            if (anyBread) return 'Solo Pan';
                                                            return `${order.box_size} Galletas`;
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="py-4 font-bold text-primary">${order.total_price}</td>
                                                <td className="py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className={`font-bold outline-none cursor-pointer appearance-none bg-transparent ${order.status === 'Pendiente' ? 'text-yellow-600' :
                                                            order.status === 'Confirmado' ? 'text-blue-600' : 'text-green-600'
                                                            }`}
                                                    >
                                                        <option value="Pendiente">Pendiente</option>
                                                        <option value="Confirmado">Confirmado</option>
                                                        <option value="Enviado">Enviado</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
