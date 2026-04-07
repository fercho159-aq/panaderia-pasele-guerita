import { PickupLocation } from './types';

export const pickupLocations: PickupLocation[] = [
    // --- Miércoles y Sábado ---
    {
        id: 'huitzizilin-dallas',
        name: 'Huitzizilin Café — Dallas',
        address: '1836 W Jefferson Blvd #120, Dallas, TX 75208',
        days: ['Wednesday', 'Saturday'],
        hours: 'Mié 7am–4pm · Sáb 7am–3pm',
        type: 'pickup'
    },

    // --- Solo Miércoles ---
    {
        id: 'tutti-frutti-hurst',
        name: 'Tutti Frutti — Hurst, TX',
        address: '394 E Pipeline Rd, Hurst, TX 76053',
        days: ['Wednesday'],
        hours: 'Mié 2pm–8pm',
        type: 'pickup'
    },

    // --- Solo Sábado (ruta) ---
    {
        id: 'irving-sat',
        name: 'Irving',
        address: '6440 N MacArthur Blvd, Irving, TX 75039',
        days: ['Saturday'],
        hours: 'Sáb 10:50am',
        type: 'pickup'
    },
    {
        id: 'carrollton-sat',
        name: 'Carrollton',
        address: '2150 N Josey Ln, Carrollton, TX 75006',
        days: ['Saturday'],
        hours: 'Sáb 11:20am',
        type: 'pickup'
    },
    {
        id: 'plano-sat',
        name: 'Plano',
        address: '1001 14th St, Plano, TX 75074',
        days: ['Saturday'],
        hours: 'Sáb 12:10pm',
        type: 'pickup'
    },
    {
        id: 'garland-sat',
        name: 'Garland',
        address: '500 W Miller Rd, Garland, TX 75041',
        days: ['Saturday'],
        hours: 'Sáb 1:00pm',
        type: 'pickup'
    },

    // --- Opción especial ---
    {
        id: 'special-coordination',
        name: 'Lavon · Princeton · Wylie',
        address: 'Selecciona esta opción y te haremos llegar los días donde podemos coordinar tu entrega.',
        days: ['Wednesday', 'Saturday'],
        hours: 'Coordinación personalizada',
        type: 'delivery'
    }
];
