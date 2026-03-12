export function calculateCookiePrice(qty: number): number {
    if (qty <= 0) return 0;

    // Volume discount: 9 or more cookies are $3.50 each
    if (qty >= 9) {
        return qty * 3.50;
    }

    // Specific box prices
    if (qty === 3) return 12.00;
    if (qty === 6) return 24.00;

    // Base price per cookie if not in these quantities and less than 9
    const basePrice = 4.00;
    return qty * basePrice;
}


export function calculateSugarFreePrice(qty: number): number {
    if (qty <= 0) return 0;
    // Sugar Free: Fijo $13.50 por 3 unidades.
    const setsOfThree = Math.ceil(qty / 3);
    return setsOfThree * 13.50;
}
