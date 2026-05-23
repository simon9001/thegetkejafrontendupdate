// context/LanguageContext.tsx
// English / Swahili language switching for GetKeja

import React, { createContext, useContext, useState, useCallback } from 'react';

export type Lang = 'en' | 'sw';

// ─── Translations ─────────────────────────────────────────────────────────────
export const translations = {
  en: {
    // Navbar
    shareYourHome:   'List your property',
    findYourKeja:    'Find your next keja',
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
    welcomeBadge:    'Your home search starts here',

    heroTitle1:      'Finding a Qeja',
    heroTitle2:      'shouldn’t',
    heroTitle3:      'Stress You.',

    heroSub:
      'Tell us your budget, preferred location and lifestyle  we’ll help you find verified houses, apartments and commercial spaces across Kenya without the endless searching.',

    subscribeBtn:    'We’ll Help You Find It',

    subscribeSub:
      'Get personalized property matches, verified listings, viewing support and smarter recommendations.',

    verifiedProps:   'Verified Properties',
    happyTenants:    'People Helped',
    counties:        'Counties Covered',

    // Category filters
    all:        'All',
    longRent:   'Long Term',
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
    seeAll:          'See all',
    listings:        'listing',
    listingsPlural:  'listings',

    noProperties:    'No listings available yet.',
    checkBack:       'Check back soon — new properties are added regularly.',
    loading:         'Loading properties...',
    propertiesAvailable: 'properties available',

    // Property card
    priceOnRequest: 'Price on request',
    viewProperty:   'View Property',

    // Footer newsletter
    newsletterTitle:
      'Get new listings and housing updates directly to your inbox',

    newsletterSub:
      'Verified properties, market insights and smart house-hunting tips — every week.',

    subscribe: 'Subscribe',

    // Contact
    sendMessage: 'Send Message',
    sending:     'Sending…',
  },

  sw: {
    // Navbar
    shareYourHome:   'Weka nyumba yako',
    findYourKeja:    'Tafuta keja yako',
    anyBudget:       'Bajeti yoyote',
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
    savedProperties: 'Nyumba ulizohifadhi',

    // Language
    language:        'Lugha',
    english:         'English',
    swahili:         'Kiswahili',

    // Hero
    welcomeBadge:    'Safari yako ya kupata nyumba inaanzia hapa',

    heroTitle1:      'Kutafuta Qeja',
    heroTitle2:      'haipaswi',
    heroTitle3:      'Kukustress.',

    heroSub:
      'Tuambie bajeti yako, eneo unalotaka na aina ya nyumba unayotafuta  tutakusaidia kupata nyumba, apartments na spaces zilizohakikishwa bila usumbufu.',

    subscribeBtn:    'Tutakusaidia Kuipata',

    subscribeSub:
      'Pata mapendekezo ya nyumba, listings zilizohakikishwa, msaada wa kupanga viewing na huduma bora zaidi.',

    verifiedProps:   'Nyumba Zilizohakikishwa',
    happyTenants:    'Watu Tuliowasaidia',
    counties:        'Kaunti Tulizofikia',

    // Category filters
    all:        'Zote',
    longRent:   'Kodi ya Muda Mrefu',
    forSale:    'Zinazouzwa',
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
    seeAll:         'Ona zote',
    listings:       'listing',
    listingsPlural: 'listings',

    noProperties:
      'Hakuna listings zinazopatikana kwa sasa.',

    checkBack:
      'Rudi tena hivi karibuni — nyumba mpya zinaongezwa mara kwa mara.',

    loading: 'Inapakia nyumba...',
    propertiesAvailable: 'nyumba zinazopatikana',

    // Property card
    priceOnRequest: 'Bei kwa ombi',
    viewProperty:   'Ona Nyumba',

    // Footer newsletter
    newsletterTitle:
      'Pata listings mpya na taarifa za nyumba moja kwa moja kwenye email yako',

    newsletterSub:
      'Nyumba zilizohakikishwa, taarifa za soko na tips za kutafuta nyumba — kila wiki.',

    subscribe: 'Jiandikishe',

    // Contact
    sendMessage: 'Tuma Ujumbe',
    sending:     'Inatuma…',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

// ─── Context ──────────────────────────────────────────────────────────────────
interface LanguageContextValue {
  lang: Lang;
  t: (key: TranslationKey) => string;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: (k) => translations.en[k],
  setLang: () => {},
  toggle: () => {},
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

  const toggle = useCallback(
    () => setLang(lang === 'en' ? 'sw' : 'en'),
    [lang, setLang]
  );

  const t = useCallback(
    (key: TranslationKey): string =>
      translations[lang][key] ?? translations.en[key],
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