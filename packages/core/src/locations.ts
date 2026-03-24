import { PickupLocation } from './types';

// Total: 2 POS, 2 Pickup, 4 Delivery
// Total: 2 Pickup, 6 Delivery/Special
export const pickupLocations: PickupLocation[] = [
    // --- Pickups ---
    {
        id: 'pickup-dallas',
        name: 'Dallas: Huitzizilin Café (Pick-up)',
        address: '1836 W Jefferson Blvd #120, Dallas, TX 75208',
        days: ['Wednesday', 'Saturday'],
        hours: 'Wed 7am-4pm, Sat 7am-3pm',
        type: 'pickup'
    },
    {
        id: 'pickup-hurst',
        name: 'Hurst Tx: Tutti Frutti (Pick-up)',
        address: '394 E Pipeline Rd, Hurst, TX 76053',
        days: ['Wednesday'],
        hours: 'Wed 2pm-8pm',
        type: 'pickup'
    },

    // --- Deliveries (Saturday Only) ---
    {
        id: 'del-dallas',
        name: 'Dallas: Huitzizilin Café (Delivery)',
        address: '1836 W Jefferson Blvd #120, Dallas, TX 75208',
        days: ['Saturday'],
        hours: '10:00 AM',
        type: 'delivery'
    },
    {
        id: 'del-irving',
        name: 'Irving (Delivery Point)',
        address: '6440 N MacArthur Blvd, Irving, TX 75039',
        days: ['Saturday'],
        hours: '10:50 AM',
        type: 'delivery'
    },
    {
        id: 'del-carrollton',
        name: 'Carrollton (Delivery Point)',
        address: '2150 N Josey Ln, Carrollton, TX 75006',
        days: ['Saturday'],
        hours: '11:20 AM',
        type: 'delivery'
    },
    {
        id: 'del-plano',
        name: 'Plano (Delivery Point)',
        address: '1001 14th St, Plano, TX 75074',
        days: ['Saturday'],
        hours: '12:10 PM',
        type: 'delivery'
    },
    {
        id: 'del-garland',
        name: 'Garland (Delivery Point)',
        address: '500 W Miller Rd, Garland, TX 75041',
        days: ['Saturday'],
        hours: '1:00 PM',
        type: 'delivery'
    },

    // --- Special ---
    {
        id: 'special-coordination',
        name: 'Lavon, Princeton, Wylie',
        address: 'Si eres de Lavon, Princeton o Wylie, selecciona esta opción para coordinar tu entrega.',
        days: ['Wednesday', 'Saturday'],
        hours: 'Coordinación personalizada',
        type: 'delivery'
    }
];
