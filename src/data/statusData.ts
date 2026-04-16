// frontend/src/data/statusData.ts

export interface StatusMedia {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
}

export interface Status {
    id: number;
    propertyId: number;
    propertyTitle: string;
    propertyImage: string;
    owner: {
        name: string;
        avatar: string;
        verified: boolean;
        role?: string;       // 'Landlord' | 'Agent' | 'Developer' | 'Caretaker'
    };
    media: StatusMedia[];
    caption?: string;
    postedAt: string;
    views: number;
    hasUnviewed: boolean;
    isBoosted?: boolean;
    // Optional property details shown in the viewer footer
    propertyDetails?: {
        price?: number;
        priceLabel?: string;   // 'KES 45,000/mo' | 'KES 12M'
        location?: string;     // 'Westlands, Nairobi'
        bedrooms?: number;
        bathrooms?: number;
        category?: string;     // 'Long Rent' | 'For Sale' | 'Short Stay'
        type?: string;         // 'Apartment' | 'House' etc.
    };
}

export const statusData: Status[] = [
    {
        id: 1,
        propertyId: 101,
        propertyTitle: 'Luxury Villa in Bali',
        propertyImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop',
        owner: {
            name: 'Nairobi Luxury Rentals',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop',
            verified: true,
            role: 'Developer',
        },
        media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop' },
        ],
        caption: 'Stunning 5-bed villa with private pool — available now!',
        postedAt: '2024-02-19T10:30:00Z',
        views: 1234,
        hasUnviewed: true,
        isBoosted: true,
        propertyDetails: {
            priceLabel: 'KES 450,000/mo',
            location: 'Lavington, Nairobi',
            bedrooms: 5,
            bathrooms: 4,
            category: 'Long Rent',
            type: 'Villa',
        },
    },
    {
        id: 2,
        propertyId: 102,
        propertyTitle: 'Modern Apartment in Westlands',
        propertyImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2070&auto=format&fit=crop',
        owner: {
            name: 'Prime Properties KE',
            avatar: 'https://images.unsplash.com/photo-1494790108777-706fd5f1e685?q=80&w=2070&auto=format&fit=crop',
            verified: true,
            role: 'Agent',
        },
        media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2070&auto=format&fit=crop' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2070&auto=format&fit=crop' },
        ],
        caption: 'Newly renovated — move in ready this month',
        postedAt: '2024-02-19T09:15:00Z',
        views: 856,
        hasUnviewed: true,
        propertyDetails: {
            priceLabel: 'KES 85,000/mo',
            location: 'Westlands, Nairobi',
            bedrooms: 3,
            bathrooms: 2,
            category: 'Long Rent',
            type: 'Apartment',
        },
    },
    {
        id: 3,
        propertyId: 103,
        propertyTitle: 'Beachfront Cottage — Diani',
        propertyImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop',
        owner: {
            name: 'Coastal Escapes',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2070&auto=format&fit=crop',
            verified: false,
            role: 'Landlord',
        },
        media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop' },
        ],
        caption: 'Your next short stay — direct ocean view 🌊',
        postedAt: '2024-02-18T16:45:00Z',
        views: 2341,
        hasUnviewed: false,
        propertyDetails: {
            priceLabel: 'KES 12,000/night',
            location: 'Diani Beach, Kwale',
            bedrooms: 2,
            bathrooms: 1,
            category: 'Short Stay',
            type: 'Cottage',
        },
    },
];
