import { Conference } from './conference';
import { ConferencePlayerData, PlayerState } from './conference-player';

// === Player Store Types ===
export interface PlayerStoreState {
    // Core State
    conference: Conference | null;
    playerData: ConferencePlayerData | null;
    playerState: PlayerState;

    // Simple UI State
    isInitialized: boolean;
    autoPlayEnabled: boolean;
}

export interface PlayerStoreActions {
    // Initialization
    initialize: (conference: Conference) => void;
    reset: () => void;

    // State Updates
    updatePlayerState: (updates: Partial<PlayerState>) => void;
    setAutoPlayEnabled: (enabled: boolean) => void;

    // Navigation
    seekToTime: (time: number) => void;
    seekToSection: (sectionIndex: number) => void;
    seekToSentence: (sentenceIndex: number) => void;
    goToNext: () => void;
    goToPrevious: () => void;

    // Computed getters
    getCurrentSection: () => any;
    getSectionAtTime: (time: number) => { section: any; sectionIndex: number } | null;
    getCurrentSentence: () => any;
}

export type PlayerStore = PlayerStoreState & PlayerStoreActions;

// === Audio Store Types ===
export interface AudioStoreState {
    audioElement: HTMLAudioElement | null;
    isPlaying: boolean;
    isPaused: boolean;
    isLoading: boolean;
    isReady: boolean;
    volume: number;
    muted: boolean;
    currentTime: number;
    duration: number;
    error: string | null;
    retryCount: number;
}

export interface AudioStoreActions {
    setAudioElement: (element: HTMLAudioElement | null) => void;
    play: () => Promise<void>;
    pause: () => void;
    stop: () => void;
    seekTo: (timeMs: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    updateAudioState: (updates: Partial<Pick<AudioStoreState, 'isPlaying' | 'isPaused' | 'isLoading' | 'isReady' | 'currentTime' | 'duration'>>) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    incrementRetry: () => void;
    resetRetry: () => void;
    syncWithElement: () => void;
    healthCheck: () => { status: string; message: string; code?: number };
}

export type AudioStore = AudioStoreState & AudioStoreActions;