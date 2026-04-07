import React, { useState, useEffect } from 'react';

interface CustomCalendarProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    minDate: Date;
    allowedDays: string[]; // e.g., ['Wednesday', 'Saturday']
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
    selectedDate, 
    onDateSelect, 
    minDate, 
    allowedDays 
}) => {
    const [viewDate, setViewDate] = useState(new Date(minDate));
    const [days, setDays] = useState<Date[]>([]);

    useEffect(() => {
        const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
        
        const dayList: Date[] = [];
        // Fill empty days at the start
        for (let i = 0; i < start.getDay(); i++) {
            const d = new Date(start);
            d.setDate(d.getDate() - (start.getDay() - i));
            dayList.push(new Date(0)); // Placeholder for empty
        }
        
        for (let i = 1; i <= end.getDate(); i++) {
            dayList.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
        }
        
        setDays(dayList);
    }, [viewDate]);

    const isDateEnabled = (date: Date) => {
        if (date.getTime() === 0) return false;
        if (date < minDate) return false;
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        return allowedDays.includes(dayName);
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const monthName = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-white rounded-[2rem] shadow-xl border border-primary/5 overflow-hidden font-sans">
            <div className="bg-primary p-6 text-white flex justify-between items-center">
                <button 
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                    className="hover:opacity-70 transition-opacity p-2"
                >
                    ←
                </button>
                <h3 className="font-serif text-2xl italic capitalize">{monthName}</h3>
                <button 
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                    className="hover:opacity-70 transition-opacity p-2"
                >
                    →
                </button>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black uppercase text-gray-400 tracking-widest py-2">
                            {d}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                    {days.map((date, i) => {
                        if (date.getTime() === 0) return <div key={i} />;
                        
                        const enabled = isDateEnabled(date);
                        const isSelected = selectedDate === formatDate(date);
                        
                        return (
                            <button
                                key={i}
                                disabled={!enabled}
                                onClick={() => onDateSelect(formatDate(date))}
                                className={`
                                    relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all
                                    ${enabled ? 'hover:bg-accent/10 cursor-pointer group' : 'opacity-20 cursor-not-allowed'}
                                    ${isSelected ? 'bg-accent/20 border-2 border-primary scale-110 z-10 shadow-lg text-primary' : 'text-primary/80'}
                                `}
                            >
                                <span className={`text-lg font-bold ${isSelected ? 'scale-110' : ''}`}>{date.getDate()}</span>
                                {enabled && !isSelected && (
                                    <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-150 transition-transform"></span>
                                )}
                                {isSelected && (
                                    <span className="absolute -top-1 -right-1 text-[10px] animate-bounce">🥐</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="bg-bg/10 p-4 border-t border-primary/5 flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-accent/20 border border-accent/30"></div>
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Días de entrega disponibles (Mié & Sáb)</span>
            </div>
        </div>
    );
};
