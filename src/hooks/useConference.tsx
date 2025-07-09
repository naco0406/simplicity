'use client';

import { ConferenceData } from '@/types/conference';
import { createContext, useContext, ReactNode } from 'react';

interface ConferenceContextType {
    conference: ConferenceData;
}

const ConferenceContext = createContext<ConferenceContextType | null>(null);

interface Props {
    children: ReactNode;
    conference: ConferenceData;
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