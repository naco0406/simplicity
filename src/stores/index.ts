// === Store Exports ===
export { audioSelectors, useAudioStore } from './audio-store';
export { playerSelectors, usePlayerStore } from './conference-player-store';

// === Type Exports ===
export type {
    AudioStore, AudioStoreActions, AudioStoreState, PlayerStore, PlayerStoreActions, PlayerStoreState
} from '@/types/store';

// === Combined Store Hook ===
import { useAudioStore } from './audio-store';
import { usePlayerStore } from './conference-player-store';

/**
 * Combined hook for accessing all stores
 * Use this for components that need multiple stores
 * For performance, prefer individual store hooks when possible
 */
export const useConferenceStores = () => {
    const player = usePlayerStore();
    const audio = useAudioStore();

    return {
        player,
        audio,
    };
};

// === Store Subscription Utilities ===

/**
 * Subscribe to specific store changes with automatic cleanup
 * Useful for effects that need to react to store changes
 */
export const createStoreSubscription = <T>(
    store: any,
    selector: (state: any) => T,
    callback: (value: T, previousValue: T) => void
) => {
    return store.subscribe(selector, callback);
};

/**
 * Utility for creating shallow equality selectors
 * Prevents unnecessary re-renders when object properties haven't changed
 */
export const createShallowSelector = <T extends Record<string, any>>(
    selector: (state: any) => T
) => {
    let previousResult: T | undefined;

    return (state: any): T => {
        const result = selector(state);

        if (!previousResult) {
            previousResult = result;
            return result;
        }

        // Shallow comparison
        const keys = Object.keys(result) as (keyof T)[];
        const hasChanged = keys.some(key => result[key] !== previousResult![key]);

        if (hasChanged) {
            previousResult = result;
            return result;
        }

        return previousResult;
    };
};

// === Store Reset Utilities ===

/**
 * Reset all stores to their initial state
 * Useful for cleanup when unmounting the player
 */
export const resetAllStores = () => {
    usePlayerStore.getState().reset();
    useAudioStore.getState().setAudioElement(null);
};
