import React, { useState } from 'react';
import Navbar from './Navbar';
import SearchModal from '../Search/SearchModal';
import { useDispatch } from 'react-redux';
import { setMapCenter, setMapRadius, setMapFilters } from '../../features/Slice/PropertiesSlice';

interface LayoutProps {
    children: React.ReactNode;
    transparentNav?: boolean;
    showSearch?: boolean;
    onSearch?: (params: { lat: number; lng: number; radius: number, maxPrice?: number, minBedrooms?: number, q?: string }) => void;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    transparentNav = false,
    showSearch = true,
    onSearch
}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const dispatch = useDispatch();

    const handleSearch = (params: {
        lat: number;
        lng: number;
        radius: number;
        maxPrice?: number;
        minBedrooms?: number;
        q?: string;
    }) => {
        dispatch(setMapCenter({ lat: params.lat, lng: params.lng }));
        dispatch(setMapRadius(params.radius));
        dispatch(setMapFilters({
            maxPrice: params.maxPrice,
            minBedrooms: params.minBedrooms,
            query: params.q
        }));
        if (onSearch) onSearch(params);
        setIsSearchOpen(false);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar
                transparent={transparentNav}
                showSearch={showSearch}
                onSearchToggle={() => setIsSearchOpen(true)}
            />
            <main className="pt-20">
                {children}
            </main>

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSearch={handleSearch}
            />
        </div>
    );
};

export default Layout;