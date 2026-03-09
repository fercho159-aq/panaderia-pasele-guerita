export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: 'cookie' | 'bread' | 'sugar-free';
}

export interface PickupLocation {
    id: string;
    name: string;
    address: string;
    days: ('Wednesday' | 'Saturday')[];
    hours: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    customer: Customer;
    pickup: PickupDetails;
    total: number;
    status: 'pending' | 'confirmed' | 'delivered';
}

export interface OrderItem {
    productId: string;
    quantity: number;
    flavor?: string;
}

export interface Customer {
    name: string;
    phone: string;
    email: string;
}

export interface PickupDetails {
    locationId: string;
    day: 'Wednesday' | 'Saturday';
    date: string;
}
