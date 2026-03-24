export const cookieFlavors = [
    { 
        id: 'choco-nuts', 
        name: 'Choco Nuts', 
        active: true,
        category: 'cookie',
        description: 'Chocolate semiamargo y nuez.',
        ingredients: 'Alérgenos: trigo, lácteos, almendras, nuez.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'fresa-coco', 
        name: 'Fresa y Coco', 
        active: true,
        category: 'cookie',
        description: 'Deliciosa combinación de fresas y coco rallado.',
        ingredients: 'Alérgenos: trigo, lácteos, almendras.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'mango-coco', 
        name: 'Mango y Coco', 
        active: true,
        category: 'cookie',
        description: 'Sabor tropical de mango con chispas de coco.',
        ingredients: 'Alérgenos: trigo, lácteos, almendras.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'abuelita', 
        name: 'Chocolate Abuelita Mexicano', 
        active: true,
        category: 'cookie',
        description: 'El sabor tradicional del chocolate Abuelita en una galleta artesanal.',
        ingredients: 'Alérgenos: trigo, lácteos, almendras.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'matcha-dark', 
        name: 'Matcha y Chocolate Oscuro', 
        active: true,
        category: 'cookie',
        description: 'Té matcha premium con trozos de chocolate oscuro.',
        ingredients: 'Alérgenos: trigo, lácteos, almendras.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'dragon-pitahaya', 
        name: 'Dragon', 
        active: true,
        category: 'cookie',
        description: 'Pitahaya vibrante y arándanos frescos.',
        ingredients: 'Alérgenos: trigo, lácteos, almendras.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'sugar-free-platano', 
        name: 'Sugar Free de Plátano', 
        active: true,
        category: 'cookie',
        price: 13.50,
        description: 'Endulzada con allulose, ideal para diabéticos. Puedes agregar nueces, chocolate amargo sin azúcar, fresa deshidratada o coco.',
        ingredients: 'Alérgenos: trigo, lácteos.',
        is_sourdough: true,
        is_gluten_free: false,
        is_sugar_free: true
    }
];

export const breadFlavors = [
    {
        id: 'hogaza-natural',
        name: 'Natural',
        active: true,
        category: 'bread',
        price: 10.00,
        description: 'Nuestra hogaza clásica de masa madre.',
        ingredients: 'Alérgenos: trigo.',
        is_sourdough: true,
        is_gluten_free: false
    },
    {
        id: 'pan-centeno-avena',
        name: 'Centeno con corteza de avena',
        active: true,
        category: 'bread',
        price: 12.00,
        description: 'Pan de centeno nutritivo con un toque de avena en la corteza.',
        ingredients: 'Alérgenos: trigo.',
        is_sourdough: true,
        is_gluten_free: false
    },
    {
        id: 'pan-semillas',
        name: 'Semillas',
        active: true,
        category: 'bread',
        price: 12.00,
        description: 'Mezcla de chía, linaza y semilla de girasol.',
        ingredients: 'Alérgenos: trigo.',
        is_sourdough: true,
        is_gluten_free: false
    },
    {
        id: 'pan-cacao-arandanos',
        name: 'Cacao con arándanos',
        active: true,
        category: 'bread',
        price: 13.00,
        description: 'Cacao, arándanos y chocolate sin azúcar.',
        ingredients: 'Alérgenos: trigo.',
        is_sourdough: true,
        is_gluten_free: false
    }
];

// Combined list for convenience
export const allProducts = [...cookieFlavors, ...breadFlavors];



export const monthlySpecial = {
    name: 'Dragon Fruit Sourdough',
    description: 'Vibrant and artisanal.'
};
