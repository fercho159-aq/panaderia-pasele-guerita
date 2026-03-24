import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface Flavor { id: string; name: string; active: boolean; stock: number; }
interface Location { id: string; name: string; days: string[]; is_sold_out: boolean; type: string; }
interface Order { id: string; customer_name: string; box_size: number; total_price: number; created_at: string; status: string; flavors_selected: Record<string, number>; sliced_breads?: Record<string, number>; notes?: string; }

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

    const updateStock = async (id: string, value: number) => {
        setFlavors(flavors.map(f => f.id === id ? { ...f, stock: value } : f));
        await fetch('/api/admin/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'stock', id, value })
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
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h2 className="font-serif text-2xl text-primary">Ventas y Producción</h2>
                            <p className="text-xs text-gray-400">Vista de control tipo Excel</p>
                        </div>
                        
                        <div className="overflow-x-auto custom-scrollbar pb-6 rounded-xl border border-gray-100">
                            <table className="w-full text-left border-collapse text-xs min-w-[1200px]">
                                <thead>
                                    <tr className="text-gray-500 uppercase font-bold tracking-widest bg-gray-50 border-b border-gray-200">
                                        <th className="p-3 w-32 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">Ubicación</th>
                                        <th className="p-3 w-40 sticky left-32 bg-gray-50 z-10 border-r border-gray-200">Cliente</th>
                                        <th className="p-3 text-center border-r border-gray-200 bg-pink-50/50 w-20">Tot. Galletas</th>
                                        {flavors.filter(f => !f.id.includes('hogaza') && !f.id.includes('pan-') && !f.id.includes('multigrano')).map(f => (
                                            <th key={f.id} className="p-3 text-center border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" title={f.name}>{f.name.split(' ')[0]}</th>
                                        ))}
                                        <th className="p-3 text-center border-r border-gray-200 bg-amber-50/50 w-20">Tot. Panes</th>
                                        {flavors.filter(f => f.id.includes('hogaza') || f.id.includes('pan-') || f.id.includes('multigrano')).map(f => (
                                            <th key={f.id} className="p-3 text-center border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" title={f.name}>{f.name.split(' ')[0]}</th>
                                        ))}
                                        <th className="p-3 text-center border-r border-gray-200 bg-gray-50">Total $</th>
                                        <th className="p-3 text-center bg-gray-50">#ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr><td colSpan={20} className="py-8 text-center text-gray-400 italic">No hay pedidos registrados.</td></tr>
                                    ) : (
                                        orders.map(order => {
                                            const cookieCount = Object.entries(order.flavors_selected || {}).reduce((sum, [id, q]) => sum + (!id.includes('hogaza') && !id.includes('pan-') && !id.includes('multigrano') ? q : 0), 0);
                                            const breadCount = Object.entries(order.flavors_selected || {}).reduce((sum, [id, q]) => sum + (id.includes('hogaza') || id.includes('pan-') || id.includes('multigrano') ? q : 0), 0);
                                            
                                            return (
                                                <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${order.status==='Cancelado' ? 'opacity-30' : ''}`}>
                                                    <td className="p-3 font-medium text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-100">
                                                        {(order as any).pickup_day || 'N/A'}
                                                    </td>
                                                    <td className="p-3 font-bold text-gray-800 sticky left-32 bg-white z-10 border-r border-gray-100">
                                                        <div className="flex flex-col">
                                                            {order.customer_name}
                                                            {order.notes && <span className="text-[9px] text-amber-600 font-normal italic mt-1 leading-tight line-clamp-2" title={order.notes}>📝 {order.notes}</span>}
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                                className={`mt-1 font-bold outline-none cursor-pointer appearance-none bg-transparent w-full text-[9px] uppercase ${order.status === 'Pendiente' ? 'text-yellow-600' :
                                                                    order.status === 'Confirmado' ? 'text-blue-600' : 'text-green-600'
                                                                    }`}
                                                            >
                                                                <option value="Pendiente">Pendiente</option>
                                                                <option value="Confirmado">Confirmado</option>
                                                                <option value="Cancelado">Cancelado</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="p-3 text-center font-bold text-pink-600 border-r border-gray-100 bg-pink-50/10">{cookieCount > 0 ? cookieCount : '-'}</td>
                                                    
                                                    {/* Cookie Columns */}
                                                    {flavors.filter(f => !f.id.includes('hogaza') && !f.id.includes('pan-') && !f.id.includes('multigrano')).map(flavor => (
                                                        <td key={flavor.id} className="p-3 text-center font-mono border-r border-gray-100 text-gray-500">
                                                            {order.flavors_selected?.[flavor.id] || ''}
                                                        </td>
                                                    ))}
                                                    
                                                    <td className="p-3 text-center font-bold text-amber-600 border-r border-gray-100 bg-amber-50/10">{breadCount > 0 ? breadCount : '-'}</td>
                                                    
                                                    {/* Bread Columns */}
                                                    {flavors.filter(f => f.id.includes('hogaza') || f.id.includes('pan-') || f.id.includes('multigrano')).map(flavor => (
                                                        <td key={flavor.id} className="p-3 text-center font-mono border-r border-gray-100 text-gray-500">
                                                            <div className="flex flex-col items-center">
                                                                <span>{order.flavors_selected?.[flavor.id] || ''}</span>
                                                                {order.sliced_breads?.[flavor.id] ? (
                                                                    <span className="text-[8px] font-black uppercase text-amber-600 mt-0.5" title={`${order.sliced_breads[flavor.id]} rebanados`}>✂️</span>
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                    ))}
                                                    
                                                    <td className="p-3 text-center font-bold text-primary border-r border-gray-100 bg-bg/20">${order.total_price}</td>
                                                    <td className="p-3 text-center font-mono text-[9px] text-gray-300">#{order.id.slice(0,6)}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    
                                    {/* --- SUMMARIES --- */}
                                    {orders.length > 0 && (
                                        <>
                                            {/* TOTAL VENDIDO */}
                                            <tr className="bg-gray-800 text-white font-bold border-t-2 border-primary">
                                                <td colSpan={2} className="p-3 text-right sticky left-0 z-10 bg-gray-800 border-r border-gray-700">TOTAL VENDIDO</td>
                                                
                                                <td className="p-3 text-center bg-pink-900 border-r border-gray-700">
                                                    {orders.filter(o=>o.status!=='Cancelado').reduce((sum, o) => sum + Object.entries(o.flavors_selected||{}).reduce((s, [id, q])=> s + (!id.includes('hogaza')&&!id.includes('pan-')&&!id.includes('multigrano') ? q : 0), 0), 0)}
                                                </td>
                                                
                                                {flavors.filter(f => !f.id.includes('hogaza') && !f.id.includes('pan-') && !f.id.includes('multigrano')).map(flavor => {
                                                    const total = orders.filter(o=>o.status!=='Cancelado').reduce((sum, o) => sum + (o.flavors_selected?.[flavor.id] || 0), 0);
                                                    return <td key={flavor.id} className="p-3 text-center border-r border-gray-700">{total}</td>;
                                                })}
                                                
                                                <td className="p-3 text-center bg-amber-900 border-r border-gray-700">
                                                    {orders.filter(o=>o.status!=='Cancelado').reduce((sum, o) => sum + Object.entries(o.flavors_selected||{}).reduce((s, [id, q])=> s + (id.includes('hogaza')||id.includes('pan-')||id.includes('multigrano') ? q : 0), 0), 0)}
                                                </td>
                                                
                                                {flavors.filter(f => f.id.includes('hogaza') || f.id.includes('pan-') || f.id.includes('multigrano')).map(flavor => {
                                                    const total = orders.filter(o=>o.status!=='Cancelado').reduce((sum, o) => sum + (o.flavors_selected?.[flavor.id] || 0), 0);
                                                    return <td key={flavor.id} className="p-3 text-center border-r border-gray-700">{total}</td>;
                                                })}
                                                
                                                <td className="p-3 text-center">${orders.filter(o=>o.status!=='Cancelado').reduce((sum, o) => sum + o.total_price, 0).toFixed(2)}</td>
                                                <td className="p-3"></td>
                                            </tr>
                                            
                                            {/* PRODUCCION */}
                                            <tr className="bg-yellow-100 text-yellow-900 font-bold border-b border-yellow-200">
                                                <td colSpan={2} className="p-3 text-right sticky left-0 z-10 bg-yellow-100 border-r border-yellow-200">PRODUCCIÓN A REALIZAR</td>
                                                <td className="p-3 border-r border-yellow-200"></td>
                                                
                                                {flavors.filter(f => !f.id.includes('hogaza') && !f.id.includes('pan-') && !f.id.includes('multigrano')).map(flavor => (
                                                    <td key={flavor.id} className="p-2 text-center border-r border-yellow-200">
                                                        <input 
                                                            type="number" 
                                                            value={flavor.stock || ''} 
                                                            onChange={(e) => updateStock(flavor.id, parseInt(e.target.value) || 0)}
                                                            className="w-full bg-white/60 text-center border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-primary py-1 px-0"
                                                        />
                                                    </td>
                                                ))}
                                                
                                                <td className="p-3 border-r border-yellow-200"></td>
                                                
                                                {flavors.filter(f => f.id.includes('hogaza') || f.id.includes('pan-') || f.id.includes('multigrano')).map(flavor => (
                                                    <td key={flavor.id} className="p-2 text-center border-r border-yellow-200">
                                                        <input 
                                                            type="number" 
                                                            value={flavor.stock || ''} 
                                                            onChange={(e) => updateStock(flavor.id, parseInt(e.target.value) || 0)}
                                                            className="w-full bg-white/60 text-center border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-primary py-1 px-0"
                                                        />
                                                    </td>
                                                ))}
                                                <td colSpan={2}></td>
                                            </tr>
                                            
                                            {/* DIFERENCIA */}
                                            <tr className="bg-gray-100 text-gray-800 font-bold border-b-2 border-gray-200">
                                                <td colSpan={2} className="p-3 text-right sticky left-0 z-10 bg-gray-100 border-r border-gray-200 text-xs">DIFERENCIA (Faltante / Sobrante)</td>
                                                <td className="p-3 border-r border-gray-200"></td>
                                                
                                                {flavors.filter(f => !f.id.includes('hogaza') && !f.id.includes('pan-') && !f.id.includes('multigrano')).map(flavor => {
                                                    const total = orders.filter(o=>o.status!=='Cancelado').reduce((sum, o) => sum + (o.flavors_selected?.[flavor.id] || 0), 0);
                                                    const diff = (flavor.stock || 0) - total;
                                                    return (
                                                        <td key={flavor.id} className={`p-3 text-center border-r border-gray-200 ${diff < 0 ? 'text-red-600 bg-red-50/50' : diff > 0 ? 'text-green-600 bg-green-50/50' : 'text-gray-400'}`}>
                                                            {diff}
                                                        </td>
                                                    );
                                                })}
                                                
                                                <td className="p-3 border-r border-gray-200"></td>
                                                
                                                {flavors.filter(f => f.id.includes('hogaza') || f.id.includes('pan-') || f.id.includes('multigrano')).map(flavor => {
                                                    const total = orders.filter(o=>o.status!=='Cancelado').reduce((sum, o) => sum + (o.flavors_selected?.[flavor.id] || 0), 0);
                                                    const diff = (flavor.stock || 0) - total;
                                                    return (
                                                        <td key={flavor.id} className={`p-3 text-center border-r border-gray-200 ${diff < 0 ? 'text-red-600 bg-red-50/50' : diff > 0 ? 'text-green-600 bg-green-50/50' : 'text-gray-400'}`}>
                                                            {diff}
                                                        </td>
                                                    );
                                                })}
                                                <td colSpan={2}></td>
                                            </tr>
                                        </>
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
