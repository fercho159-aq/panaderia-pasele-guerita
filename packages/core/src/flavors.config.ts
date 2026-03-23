export const cookieFlavors = [
    { 
        id: 'choco-nuts', 
        name: 'Choco Nuts', 
        active: true,
        description: 'La clásica reinventada con nueces tostadas y doble chocolate.',
        ingredients: 'Masa madre, chispas de chocolate semi-amargo, nuez pecana, mantequilla, azúcar morena.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'matcha', 
        name: 'Matcha', 
        active: true,
        description: 'Elegancia oriental con un toque indulgente de chocolate blanco.',
        ingredients: 'Masa madre, polvo de matcha ceremonial, trozos de chocolate blanco.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'dragon', 
        name: 'Dragón', 
        active: true,
        description: 'Color vibrante 100% natural infusionado con pitahaya.',
        ingredients: 'Polvo de pitahaya (dragon fruit), masa madre, vainilla, azúcar.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'classic', 
        name: 'Classic Sourdough', 
        active: true,
        description: 'Nuestra firma. Un equilibrio perfecto entre lo dulce y ese sutil toque acidito.',
        ingredients: 'Masa madre pura, mantequilla artesanal, azúcar de caña.',
        is_sourdough: true,
        is_gluten_free: false
    },
    { 
        id: 'glam-pecan', // Assuming the 5th flavor might be a gluten free or new one, but let's add a placeholder just in case, or let DB fetch handle the 5th.
        name: 'Glam Pecan GF', 
        active: true,
        description: 'Todo el sabor, cero gluten. Totalmente deliciosa.',
        ingredients: 'Harina de almendra, nuez pecana, mantequilla clarificada, azúcar de coco.',
        is_sourdough: false,
        is_gluten_free: true
    }
];

export const monthlySpecial = {
    name: 'Dragon Fruit Sourdough',
    description: 'Vibrant and artisanal.'
};
