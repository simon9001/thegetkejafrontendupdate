// context/LanguageContext.tsx
// English / Swahili language switching for Getkeja
import React, { createContext, useContext, useState, useCallback } from 'react';

export type Lang = 'en' | 'sw';

// ─── Translations ─────────────────────────────────────────────────────────────
export const translations = {
  en: {
    // Navbar
    shareYourHome:   'Share your home',
    findYourKeja:    'Find your keja',
    anyBudget:       'Any budget',
    anywhere:        'Anywhere',
    login:           'Log in',
    signup:          'Sign up',
    logout:          'Log out',
    dashboard:       'Dashboard',
    profile:         'Profile',
    trips:           'Trips',
    messages:        'Messages',
    saved:           'Saved',
    settings:        'Settings',
    help:            'Help',
    savedProperties: 'Saved properties',
    // Language
    language:        'Language',
    english:         'English',
    swahili:         'Kiswahili',
    // Hero
    welcomeBadge:    'Welcome to GetKeja',
    heroTitle1:      'Find Your',
    heroTitle2:      'Perfect',
    heroTitle3:      'Property in Kenya',
    heroSub:         'Browse thousands of verified rentals, homes for sale, and commercial spaces across Kenya.',
    subscribeBtn:    'Subscribe for a Seamless Experience',
    subscribeSub:    'Unlock property viewings, AI picks & priority support from KES 0/mo',
    verifiedProps:   'Verified Properties',
    happyTenants:    'Happy Tenants',
    counties:        'Counties',
    // Category filters
    all:        'All',
    longRent:   'Long Rent',
    forSale:    'For Sale',
    shortStay:  'Short Stay',
    commercial: 'Commercial',
    // Filter panel
    filters:    'Filters',
    clear:      'Clear',
    bedrooms:   'Bedrooms',
    areaLabel:  'Area / Location',
    minPrice:   'Min Price (KES)',
    maxPrice:   'Max Price (KES)',
    any:        'Any',
    bedsitter:  'Bedsitter',
    // Property sections
    seeAll:     'See all',
    listings:   'listing',
    listingsPlural: 'listings',
    noProperties: 'No properties available yet.',
    checkBack:    'Check back soon — new listings are added daily.',
    loading:      'Loading properties...',
    propertiesAvailable: 'properties available',
    // Property card
    priceOnRequest: 'Price on request',
    viewProperty:   'View Property',
    // Footer newsletter
    newsletterTitle: 'Get the latest listings straight to your inbox',
    newsletterSub:   'New properties, market insights, tips — weekly.',
    subscribe:       'Subscribe',
    // Contact
    sendMessage:   'Send Message',
    sending:       'Sending…',
  },
  sw: {
    // Navbar
    shareYourHome:   'Shiriki nyumba yako',
    findYourKeja:    'Tafuta keja yako',
    anyBudget:       'Bei yoyote',
    anywhere:        'Popote',
    login:           'Ingia',
    signup:          'Jisajili',
    logout:          'Toka',
    dashboard:       'Dashibodi',
    profile:         'Wasifu',
    trips:           'Safari',
    messages:        'Ujumbe',
    saved:           'Zilizohifadhiwa',
    settings:        'Mipangilio',
    help:            'Msaada',
    savedProperties: 'Mali zilizohifadhiwa',
    // Language
    language:        'Lugha',
    english:         'English',
    swahili:         'Kiswahili',
    // Hero
    welcomeBadge:    'Karibu GetKeja',
    heroTitle1:      'Pata',
    heroTitle2:      'Keja Bora',
    heroTitle3:      'Kenya',
    heroSub:         'Vinjari maelfu ya nyumba za kukodisha zilizohakikishwa, nyumba za kuuza, na maeneo ya biashara kote Kenya.',
    subscribeBtn:    'Jiandikishe kwa Uzoefu Mzuri',
    subscribeSub:    'Fungua uangalifu wa mali, mapendekezo ya AI na msaada wa kipaumbele kutoka KES 0/mwezi',
    verifiedProps:   'Mali Zilizohakikishwa',
    happyTenants:    'Wakodi Wenye Furaha',
    counties:        'Kaunti',
    // Category filters
    all:        'Zote',
    longRent:   'Kukodisha',
    forSale:    'Kuuza',
    shortStay:  'Muda Mfupi',
    commercial: 'Biashara',
    // Filter panel
    filters:    'Vichujio',
    clear:      'Futa',
    bedrooms:   'Vyumba vya kulala',
    areaLabel:  'Eneo / Mahali',
    minPrice:   'Bei ya Chini (KES)',
    maxPrice:   'Bei ya Juu (KES)',
    any:        'Yoyote',
    bedsitter:  'Bedsitter',
    // Property sections
    seeAll:     'Ona zote',
    listings:   'orodha',
    listingsPlural: 'orodha',
    noProperties: 'Hakuna mali zinazopatikana bado.',
    checkBack:    'Angalia hivi karibuni — orodha mpya zinaongezwa kila siku.',
    loading:      'Inapakia mali...',
    propertiesAvailable: 'mali zinazopatikana',
    // Property card
    priceOnRequest: 'Bei kwa ombi',
    viewProperty:   'Ona Mali',
    // Footer newsletter
    newsletterTitle: 'Pata orodha mpya moja kwa moja kwenye barua pepe yako',
    newsletterSub:   'Mali mpya, maarifa ya soko, vidokezo — kila wiki.',
    subscribe:       'Jiandikishe',
    // Contact
    sendMessage:   'Tuma Ujumbe',
    sending:       'Inatuma…',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

// ─── Context ──────────────────────────────────────────────────────────────────
interface LanguageContextValue {
  lang:      Lang;
  t:         (key: TranslationKey) => string;
  setLang:   (l: Lang) => void;
  toggle:    () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang:    'en',
  t:       (k) => translations.en[k],
  setLang: () => {},
  toggle:  () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stored = (localStorage.getItem('gk_lang') ?? 'en') as Lang;
  const [lang, _setLang] = useState<Lang>(stored);

  const setLang = useCallback((l: Lang) => {
    _setLang(l);
    localStorage.setItem('gk_lang', l);
    document.documentElement.lang = l;
  }, []);

  const toggle = useCallback(() => setLang(lang === 'en' ? 'sw' : 'en'), [lang, setLang]);

  const t = useCallback(
    (key: TranslationKey): string => translations[lang][key] ?? translations.en[key],
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useLanguage = () => useContext(LanguageContext);
