export const cookieFlavors = [
    { 
        id: 'choco-nuts', 
        name: 'Choco Nuts', 
        active: true,
        category: 'cookie',
        price: 12.00,
        description: 'La clásica reinventada con nueces tostadas y doble chocolate.',
        ingredients: 'Masa madre, chispas de chocolate semi-amargo, nuez pecana, mantequilla, azúcar morena.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'matcha', 
        name: 'Matcha', 
        active: true,
        category: 'cookie',
        price: 12.00,
        description: 'Elegancia oriental con un toque indulgente de chocolate blanco.',
        ingredients: 'Masa madre, polvo de matcha ceremonial, trozos de chocolate blanco.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'dragon', 
        name: 'Dragón', 
        active: true,
        category: 'cookie',
        price: 12.00,
        description: 'Color vibrante 100% natural infusionado con pitahaya.',
        ingredients: 'Polvo de pitahaya (dragon fruit), masa madre, vainilla, azúcar.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'classic', 
        name: 'Classic Sourdough', 
        active: true,
        category: 'cookie',
        price: 12.00,
        description: 'Nuestra firma. Un equilibrio perfecto entre lo dulce y ese sutil toque acidito.',
        ingredients: 'Masa madre pura, mantequilla artesanal, azúcar de caña.',
        is_sourdough: true,
        is_gluten_free: false
    }
];

export const breadFlavors = [
    {
        id: 'hogaza-clasica',
        name: 'Hogaza Clásica',
        active: true,
        category: 'bread',
        price: 18.00,
        description: 'Nuestro pan insignia. Corteza crujiente, miga abierta y un sabor ligeramente ácido, fruto de 48h de fermentación lenta.',
        ingredients: 'Harina de trigo de fuerza, agua, sal marina, masa madre activa. Sin conservadores.',
        is_sourdough: true,
        is_gluten_free: false
    },
    {
        id: 'pan-centeno',
        name: 'Pan de Centeno',
        active: true,
        category: 'bread',
        price: 20.00,
        description: 'Denso, nutritivo y con un perfil de sabor terroso característico. Alto en fibra y menor índice glucémico.',
        ingredients: 'Harina de centeno integral, harina de trigo, agua, sal marina, semillas de alcaravea, masa madre activa.',
        is_sourdough: true,
        is_gluten_free: false
    },
    {
        id: 'multigrano',
        name: 'Multigrano con Semillas',
        active: true,
        category: 'bread',
        price: 22.00,
        description: 'La opción más completa. Una mezcla de granos y semillas que aporta textura, sabor y bienestar en cada rebanada.',
        ingredients: 'Harina integral, harina de avena, semillas de girasol, pepitas, linaza, ajonjolí, agua, sal, masa madre activa.',
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
