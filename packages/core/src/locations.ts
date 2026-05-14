import { PickupLocation } from './types';

export const pickupLocations: PickupLocation[] = [
    // --- Miércoles y Sábado ---
    {
        id: 'huitzizilin-dallas',
        name: 'Huitzizilin Café — Dallas',
        address: '1836 W Jefferson Blvd #120, Dallas, TX 75208',
        days: ['Wednesday', 'Saturday'],
        hours: 'Mié 1pm–4pm · Sáb 10am–3pm',
        hours_en: 'Wed 1pm–4pm · Sat 10am–3pm',
        type: 'pickup'
    } as any,

    // --- Solo Miércoles ---
    {
        id: 'tutti-frutti-hurst',
        name: 'Tutti Frutti — Hurst, TX',
        address: '394 E Pipeline Rd, Hurst, TX 76053',
        days: ['Wednesday'],
        hours: 'Mié 2pm–8pm',
        hours_en: 'Wed 2pm–8pm',
        type: 'pickup'
    } as any,

    // --- Solo Sábado (ruta) ---
    {
        id: 'irving-sat',
        name: 'Irving',
        address: '6440 N MacArthur Blvd, Ste 110, Irving, TX 75039',
        days: ['Saturday'],
        hours: 'Sáb 10:50am',
        hours_en: 'Sat 10:50am',
        type: 'pickup'
    } as any,
    {
        id: 'carrollton-sat',
        name: 'Carrollton',
        address: '2150 N Josey Ln, Suite 132, Carrollton, TX',
        days: ['Saturday'],
        hours: 'Sáb 11:20am',
        hours_en: 'Sat 11:20am',
        type: 'pickup'
    } as any,
    {
        id: 'plano-sat',
        name: 'Plano',
        address: '1001 14th St #100, Plano, TX 75074',
        days: ['Saturday'],
        hours: 'Sáb 12:20pm',
        hours_en: 'Sat 12:20pm',
        type: 'pickup'
    } as any,
    {
        id: 'garland-sat',
        name: 'Garland',
        address: '500 W Miller Rd, Garland, TX 75041',
        days: ['Saturday'],
        hours: 'Sáb 1:00pm',
        hours_en: 'Sat 1:00pm',
        type: 'pickup'
    } as any,

    // --- Opción especial ---
    {
        id: 'special-coordination',
        name: 'Lavon · Princeton · Wylie',
        address: 'Selecciona esta opción y te haremos llegar los días donde podemos coordinar tu entrega.',
        address_en: 'Select this option and we will reach out with available delivery days for your area.',
        days: ['Wednesday', 'Saturday'],
        hours: 'Coordinación personalizada',
        hours_en: 'Custom coordination',
        type: 'delivery'
    } as any
];

/**
 * Returns a location copy with address/hours swapped to the requested language
 * if an *_en variant exists. The `name` stays as-is (proper names of physical
 * places don't translate).
 */
export function localizedLocation<T extends { name?: string; address?: string; hours?: string }>(
    loc: T,
    lang: 'es' | 'en'
): T {
    if (!loc || lang !== 'en') return loc;
    const l = loc as any;
    return {
        ...loc,
        address: l.address_en || loc.address,
        hours: l.hours_en || loc.hours,
    };
}
