'use client';

import { ConferenceData } from '@/types/conference';
import { createContext, useContext, useState, ReactNode } from 'react';

interface FocusedConferenceContextType {
  focusedConference: ConferenceData | null;
  setFocusedConference: (conference: ConferenceData | null) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  hasFocusedConference: boolean;
}

const FocusedConferenceContext = createContext<FocusedConferenceContextType | undefined>(undefined);

interface FocusedConferenceProviderProps {
  children: ReactNode;
}

export const FocusedConferenceProvider: React.FC<FocusedConferenceProviderProps> = ({ children }) => {
  const [focusedConference, setFocusedConference] = useState<ConferenceData | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const hasFocusedConference = focusedConference !== null;

  const value = {
    focusedConference,
    setFocusedConference,
    focusedIndex,
    setFocusedIndex,
    hasFocusedConference,
  };

  return (
    <FocusedConferenceContext.Provider value={value}>
      {children}
    </FocusedConferenceContext.Provider>
  );
};

export const useFocusedConferenceContext = () => {
  const context = useContext(FocusedConferenceContext);
  if (context === undefined) {
    throw new Error('useFocusedConferenceContext must be used within a FocusedConferenceProvider');
  }
  return context;
}; 