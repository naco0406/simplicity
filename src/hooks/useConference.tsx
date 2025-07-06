'use client';

import { Conference } from '@/types/conference';
import { createContext, useContext, ReactNode } from 'react';

interface ConferenceContextType {
    conference: Conference;
}

const ConferenceContext = createContext<ConferenceContextType | null>(null);

interface Props {
    children: ReactNode;
    conference: Conference;
}

export const ConferenceProvider = ({ children, conference }: Props) => {
    return (
        <ConferenceContext.Provider value={{ conference }}>
            {children}
        </ConferenceContext.Provider>
    );
};

export const useConference = () => {
    const context = useContext(ConferenceContext);
    if (!context) {
        throw new Error('useConference must be used within a ConferenceProvider');
    }
    return context;
};