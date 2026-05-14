import es from './es.json';
import en from './en.json';

export const LANGUAGES = ['es', 'en'] as const;
export type Language = typeof LANGUAGES[number];

export const DEFAULT_LANG: Language = 'es';

const dictionaries: Record<Language, any> = { es, en };

export const LANGUAGE_LABELS: Record<Language, string> = {
    es: 'Español',
    en: 'English',
};

export function isValidLang(lang: string | undefined): lang is Language {
    return !!lang && (LANGUAGES as readonly string[]).includes(lang);
}

/**
 * Get a translation by key path (e.g. "nav.home" or "home.hero.title").
 * Returns the original key if the translation is missing — visible during development.
 */
export function t(lang: Language, key: string): any {
    const keys = key.split('.');
    let value: any = dictionaries[lang];

    for (const k of keys) {
        if (value == null) return key;
        value = value[k];
    }

    return value === undefined ? key : value;
}

/**
 * Build a localized URL path. Always includes the language prefix.
 * Examples:
 *   localizedPath('es', '/menu')   -> '/es/menu'
 *   localizedPath('en', '/')       -> '/en'
 *   localizedPath('es', '/menu/')  -> '/es/menu/'
 */
export function localizedPath(lang: Language, path: string): string {
    if (path === '/' || path === '') return `/${lang}`;
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${clean}`;
}

/**
 * Extract the language from a URL pathname. Returns null if no valid lang prefix.
 */
export function getLangFromUrl(url: URL | string): Language | null {
    const pathname = typeof url === 'string' ? url : url.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const first = segments[0];
    return isValidLang(first) ? first : null;
}

/**
 * Build the equivalent URL in the target language. Used by the language switcher.
 */
export function switchLangUrl(currentUrl: URL | string, targetLang: Language): string {
    const pathname = typeof currentUrl === 'string' ? currentUrl : currentUrl.pathname;
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length > 0 && isValidLang(segments[0])) {
        segments[0] = targetLang;
    } else {
        segments.unshift(targetLang);
    }

    return '/' + segments.join('/');
}

/**
 * Returns a bound translator function for a given language. Convenience helper.
 *   const tr = useTranslations('es');
 *   tr('nav.home') // -> 'Inicio'
 */
export function useTranslations(lang: Language) {
    return (key: string) => t(lang, key);
}

/**
 * Detect the current language from window.location at render time.
 * Used by client-side React components that aren't passed an explicit `lang` prop
 * (e.g. CartDrawer is mounted globally in the Layout).
 *
 * SSR-safe: returns DEFAULT_LANG when window is not available.
 */
export function getLangFromPathname(): Language {
    if (typeof window === 'undefined') return DEFAULT_LANG;
    const first = window.location.pathname.split('/').filter(Boolean)[0];
    return isValidLang(first) ? first : DEFAULT_LANG;
}

/**
 * Internal sliced-bread marker. We keep `(Rebanado)` in the cart item name
 * as the canonical identifier so all existing detection code keeps working,
 * but swap it for the localized label at display time.
 */
export const SLICED_MARKER = '(Rebanado)';

export function displaySlicedName(name: string, lang: Language): string {
    if (lang === 'en' && name.includes(SLICED_MARKER)) {
        return name.replace(SLICED_MARKER, '(Sliced)');
    }
    return name;
}
