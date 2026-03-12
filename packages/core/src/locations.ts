import { PickupLocation } from './types';

// Total: 2 POS, 2 Pickup, 4 Delivery
export const pickupLocations: PickupLocation[] = [
    // --- Points of Sale (POS) ---
    {
        id: 'pos-1',
        name: 'Bishop Arts District (POS)',
        address: '400 N Bishop Ave, Dallas, TX',
        days: ['Saturday'],
        hours: '9:00 AM - 1:00 PM',
        type: 'pos'
    },
    {
        id: 'pos-2',
        name: 'Deep Ellum Market (POS)',
        address: '2800 Main St, Dallas, TX',
        days: ['Wednesday'],
        hours: '10:00 AM - 2:00 PM',
        type: 'pos',
        isSoldOut: true // For UX testing
    },

    // --- Pickups ---
    {
        id: 'pickup-1',
        name: 'White Rock Lake (Pickup)',
        address: '8300 E Lawther Dr, Dallas, TX',
        days: ['Saturday'],
        hours: '8:30 AM - 12:30 PM',
        type: 'pickup'
    },
    {
        id: 'pickup-2',
        name: 'Victory Park (Pickup)',
        address: '2500 Victory Ave, Dallas, TX',
        days: ['Wednesday', 'Saturday'],
        hours: '11:00 AM - 3:00 PM',
        type: 'pickup'
    },

    // --- Deliveries ---
    {
        id: 'del-1',
        name: 'Uptown Area (Delivery)',
        address: 'Zip Codes: 75204, 75201',
        days: ['Wednesday'],
        hours: '3:00 PM - 6:00 PM',
        type: 'delivery'
    },
    {
        id: 'del-2',
        name: 'Oak Lawn (Delivery)',
        address: 'Zip Codes: 75219',
        days: ['Wednesday'],
        hours: '1:00 PM - 4:00 PM',
        type: 'delivery'
    },
    {
        id: 'del-3',
        name: 'Highland Park (Delivery)',
        address: 'Zip Codes: 75205',
        days: ['Saturday'],
        hours: '2:00 PM - 5:00 PM',
        type: 'delivery'
    },
    {
        id: 'del-4',
        name: 'Preston Hollow (Delivery)',
        address: 'Zip Codes: 75225',
        days: ['Saturday'],
        hours: '10:00 AM - 2:00 PM',
        type: 'delivery'
    }
];
