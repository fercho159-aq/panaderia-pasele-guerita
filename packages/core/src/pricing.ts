export function calculateCookiePrice(qty: number): number {
    if (qty <= 0) return 0;
    // 3=$12, 6=$24, 9=$31.50
    if (qty === 3) return 12.00;
    if (qty === 6) return 24.00;
    if (qty === 9) return 31.50;

    // Base price per cookie if not in these quantities (fallback)
    const basePrice = 4.00;
    return qty * basePrice;
}

export function calculateSugarFreePrice(qty: number): number {
    if (qty <= 0) return 0;
    // Sugar Free: Fijo $13.50 por 3 unidades.
    const setsOfThree = Math.ceil(qty / 3);
    return setsOfThree * 13.50;
}
