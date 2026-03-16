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
    };
    media: StatusMedia[];
    postedAt: string;
    views: number;
    hasUnviewed: boolean;
}

export const statusData: Status[] = [
    {
        id: 1,
        propertyId: 101,
        propertyTitle: 'Luxury Villa in Bali',
        propertyImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop',
        owner: {
            name: 'Bali Luxury Rentals',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop',
            verified: true,
        },
        media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop' },
            { type: 'video', url: 'https://example.com/video1.mp4' },
        ],
        postedAt: '2024-02-19T10:30:00Z',
        views: 1234,
        hasUnviewed: true,
    },
    {
        id: 2,
        propertyId: 102,
        propertyTitle: 'Modern Apartment in NYC',
        propertyImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2070&auto=format&fit=crop',
        owner: {
            name: 'NYC Properties',
            avatar: 'https://images.unsplash.com/photo-1494790108777-706fd5f1e685?q=80&w=2070&auto=format&fit=crop',
            verified: true,
        },
        media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2070&auto=format&fit=crop' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2070&auto=format&fit=crop' },
        ],
        postedAt: '2024-02-19T09:15:00Z',
        views: 856,
        hasUnviewed: true,
    },
    {
        id: 3,
        propertyId: 103,
        propertyTitle: 'Beach House in Maldives',
        propertyImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop',
        owner: {
            name: 'Maldives Escapes',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2070&auto=format&fit=crop',
            verified: false,
        },
        media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop' },
        ],
        postedAt: '2024-02-18T16:45:00Z',
        views: 2341,
        hasUnviewed: false,
    },
];
