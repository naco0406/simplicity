import { AudioStore } from '@/types/store';
import { MAX_RETRIES } from '@/utils/constants';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

const LOADING_TIMEOUT = 15000;

export const useAudioStore = create<AudioStore>()(
    devtools(
        subscribeWithSelector((set, get) => ({
            // === State ===
            audioElement: null,
            isPlaying: false,
            isPaused: false,
            isLoading: false,
            isReady: false,
            volume: 1.0,
            muted: false,
            currentTime: 0,
            duration: 0,
            error: null,
            retryCount: 0,

            // === Audio Element Management ===
            setAudioElement: (element: HTMLAudioElement | null) => {
                const currentState = get();

                // Clean up previous element
                if (currentState.audioElement && currentState.audioElement !== element) {
                    try {
                        currentState.audioElement.pause();
                        currentState.audioElement.currentTime = 0;
                        currentState.audioElement.src = '';
                    } catch (error) {
                        console.warn('Error cleaning up previous audio element:', error);
                    }
                }

                // Set new state
                set({
                    ...currentState,
                    audioElement: element,
                    isReady: element ? false : false,
                    isLoading: element ? false : false, // Will be set to true when loading starts
                    isPlaying: false,
                    isPaused: false,
                    error: null,
                    retryCount: 0,
                    currentTime: 0,
                    duration: 0,
                });

                if (element) {
                    // Set up event listeners with better error handling
                    const handleLoadStart = () => {
                        set((state) => ({
                            ...state,
                            isLoading: true,
                            isReady: false,
                            error: null,
                        }));
                    };

                    const handleLoadedMetadata = () => {
                        set((state) => ({
                            ...state,
                            duration: (element.duration || 0) * 1000,
                        }));
                    };

                    const handleCanPlay = () => {
                        set((state) => ({
                            ...state,
                            isReady: true,
                            isLoading: false,
                            error: null,
                        }));
                    };

                    const handleCanPlayThrough = () => {
                        set((state) => ({
                            ...state,
                            isReady: true,
                            isLoading: false,
                            error: null,
                        }));
                    };

                    const handleLoadedData = () => {
                        if (element.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                            set((state) => ({
                                ...state,
                                isReady: true,
                                isLoading: false,
                                error: null,
                            }));
                        }
                    };

                    const handleError = (e: Event) => {
                        console.error('Audio error event:', e);
                        const audioError = element.error;
                        let errorMessage = 'Failed to load audio';

                        if (audioError) {
                            switch (audioError.code) {
                                case MediaError.MEDIA_ERR_ABORTED:
                                    errorMessage = 'Audio loading was aborted';
                                    break;
                                case MediaError.MEDIA_ERR_NETWORK:
                                    errorMessage = 'Network error while loading audio';
                                    break;
                                case MediaError.MEDIA_ERR_DECODE:
                                    errorMessage = 'Audio decoding error';
                                    break;
                                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                    errorMessage = 'Audio format not supported';
                                    break;
                                default:
                                    errorMessage = 'Unknown audio error';
                            }
                        }

                        set((state) => ({
                            ...state,
                            error: errorMessage,
                            isLoading: false,
                            isReady: false,
                            isPlaying: false,
                            isPaused: false,
                        }));
                    };

                    const handleEnded = () => {
                        set((state) => ({
                            ...state,
                            isPlaying: false,
                            isPaused: false,
                        }));

                        // Dispatch custom event for other components
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('audioEnded'));
                        }
                    };

                    const handlePlay = () => {
                        set((state) => ({
                            ...state,
                            isPlaying: true,
                            isPaused: false,
                            error: null,
                        }));
                    };

                    const handlePause = () => {
                        set((state) => ({
                            ...state,
                            isPlaying: false,
                            isPaused: true,
                        }));
                    };

                    const handleTimeUpdate = () => {
                        const currentTime = (element.currentTime || 0) * 1000;
                        set((state) => ({
                            ...state,
                            currentTime,
                        }));
                    };

                    const handleStalled = () => {
                        console.warn('Audio stalled');
                    };

                    const handleWaiting = () => {
                        console.warn('Audio waiting for data');
                        set((state) => ({
                            ...state,
                            isLoading: true,
                        }));
                    };

                    const handleSuspend = () => {
                        console.warn('Audio loading suspended');
                    };

                    const handleProgress = () => {
                        // Check if enough data is buffered
                        if (element.buffered.length > 0) {
                            const bufferedEnd = element.buffered.end(element.buffered.length - 1);
                            const currentTime = element.currentTime;
                            const hasEnoughBuffer = bufferedEnd - currentTime > 5; // 5 seconds ahead

                            if (hasEnoughBuffer && get().isLoading) {
                                set((state) => ({
                                    ...state,
                                    isLoading: false,
                                }));
                            }
                        }
                    };

                    // Add all event listeners
                    element.addEventListener('loadstart', handleLoadStart);
                    element.addEventListener('loadedmetadata', handleLoadedMetadata);
                    element.addEventListener('loadeddata', handleLoadedData);
                    element.addEventListener('canplay', handleCanPlay);
                    element.addEventListener('canplaythrough', handleCanPlayThrough);
                    element.addEventListener('error', handleError);
                    element.addEventListener('ended', handleEnded);
                    element.addEventListener('play', handlePlay);
                    element.addEventListener('pause', handlePause);
                    element.addEventListener('timeupdate', handleTimeUpdate);
                    element.addEventListener('stalled', handleStalled);
                    element.addEventListener('waiting', handleWaiting);
                    element.addEventListener('suspend', handleSuspend);
                    element.addEventListener('progress', handleProgress);

                    // Set initial properties
                    const state = get();
                    try {
                        element.volume = state.volume;
                        element.muted = state.muted;
                        element.preload = 'auto';
                    } catch (error) {
                        console.warn('Error setting initial audio properties:', error);
                    }

                    // Set up loading timeout
                    const loadingTimeout = setTimeout(() => {
                        const currentState = get();
                        if (currentState.isLoading && !currentState.isReady) {
                            console.error('Audio loading timeout');
                            set((state) => ({
                                ...state,
                                error: 'Audio loading timeout',
                                isLoading: false,
                                isReady: false,
                            }));
                        }
                    }, LOADING_TIMEOUT);

                    // Store timeout reference for cleanup
                    (element as any)._loadingTimeout = loadingTimeout;
                }
            },

            // === Playback Controls ===
            play: async () => {
                const { audioElement, isReady, error, retryCount, isPlaying } = get();

                if (!audioElement) {
                    throw new Error('Audio element not available');
                }

                // Don't play if already playing
                if (isPlaying && !audioElement.paused) {
                    console.warn('Audio already playing');
                    return;
                }

                // Wait for ready state if needed
                if (!isReady && retryCount < MAX_RETRIES) {
                    console.warn('Audio not ready, waiting...');
                    set((state) => ({
                        ...state,
                        retryCount: state.retryCount + 1,
                        isLoading: true,
                    }));

                    // Wait for ready state with timeout
                    const readyPromise = new Promise<void>((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Audio not ready timeout'));
                        }, 5000);

                        const checkReady = () => {
                            const currentState = get();
                            if (currentState.isReady) {
                                clearTimeout(timeout);
                                resolve();
                            } else if (currentState.error) {
                                clearTimeout(timeout);
                                reject(new Error(currentState.error || 'Audio error'));
                            } else {
                                setTimeout(checkReady, 100);
                            }
                        };

                        checkReady();
                    });

                    try {
                        await readyPromise;
                    } catch (readyError) {
                        console.error('Error waiting for audio ready:', readyError);
                        set((state) => ({
                            ...state,
                            error: readyError instanceof Error ? readyError.message : 'Audio not ready',
                            isLoading: false,
                        }));
                        throw readyError;
                    }
                }

                const currentState = get();
                if (currentState.error) {
                    throw new Error(`Audio error: ${currentState.error}`);
                }

                if (!currentState.isReady) {
                    throw new Error('Audio not ready');
                }

                try {
                    // Clear any previous errors
                    set((state) => ({
                        ...state,
                        isLoading: false,
                        error: null,
                    }));

                    // Attempt to play
                    const playPromise = audioElement.play();

                    if (playPromise !== undefined) {
                        await playPromise;
                    }

                } catch (error) {
                    console.error('Failed to play audio:', error);

                    let errorMessage = 'Failed to play audio';
                    if (error instanceof Error) {
                        if (error.name === 'NotAllowedError') {
                            errorMessage = 'Audio autoplay blocked by browser. Please click play button.';
                        } else if (error.name === 'NotSupportedError') {
                            errorMessage = 'Audio format not supported';
                        } else {
                            errorMessage = error.message;
                        }
                    }

                    set((state) => ({
                        ...state,
                        error: errorMessage,
                        isPlaying: false,
                        isPaused: false,
                        isLoading: false,
                    }));
                    throw error;
                }
            },

            pause: () => {
                const { audioElement, isPlaying } = get();

                if (audioElement && isPlaying) {
                    try {
                        audioElement.pause();
                    } catch (error) {
                        console.error('Error pausing audio:', error);
                    }
                }
            },

            stop: () => {
                const { audioElement } = get();

                if (audioElement) {
                    try {
                        audioElement.pause();
                        audioElement.currentTime = 0;
                    } catch (error) {
                        console.error('Error stopping audio:', error);
                    }
                }

                set((state) => ({
                    ...state,
                    isPlaying: false,
                    isPaused: false,
                    currentTime: 0,
                }));
            },

            seekTo: (timeMs: number) => {
                const { audioElement, isReady } = get();

                if (audioElement && isReady) {
                    try {
                        const timeSeconds = Math.max(0, timeMs / 1000);

                        // Check if the seek time is within bounds
                        if (audioElement.duration && timeSeconds <= audioElement.duration) {
                            audioElement.currentTime = timeSeconds;

                            set((state) => ({
                                ...state,
                                currentTime: timeMs,
                            }));
                        } else {
                            console.warn(`Seek time ${timeSeconds}s is out of bounds (duration: ${audioElement.duration}s)`);
                        }
                    } catch (error) {
                        console.error('Error seeking audio:', error);
                    }
                } else {
                    console.warn('Cannot seek: audio not ready');
                }
            },

            // === Volume Controls ===
            setVolume: (volume: number) => {
                const clampedVolume = Math.max(0, Math.min(1, volume));
                const { audioElement } = get();

                if (audioElement) {
                    try {
                        audioElement.volume = clampedVolume;
                    } catch (error) {
                        console.error('Error setting volume:', error);
                    }
                }

                set((state) => ({
                    ...state,
                    volume: clampedVolume,
                    muted: clampedVolume > 0 ? false : state.muted,
                }));
            },

            toggleMute: () => {
                const { audioElement, muted } = get();
                const newMuted = !muted;

                if (audioElement) {
                    try {
                        audioElement.muted = newMuted;
                    } catch (error) {
                        console.error('Error toggling mute:', error);
                    }
                }

                set((state) => ({
                    ...state,
                    muted: newMuted,
                }));
            },

            // === State Updates ===
            updateAudioState: (updates) => {
                set((state) => ({
                    ...state,
                    ...updates,
                }));
            },

            setError: (error: string | null) => {
                set((state) => ({
                    ...state,
                    error,
                    isPlaying: error ? false : state.isPlaying,
                    isLoading: error ? false : state.isLoading,
                }));
            },

            clearError: () => {
                set((state) => ({
                    ...state,
                    error: null,
                    retryCount: 0,
                }));
            },

            incrementRetry: () => {
                set((state) => ({
                    ...state,
                    retryCount: state.retryCount + 1,
                }));
            },

            resetRetry: () => {
                set((state) => ({
                    ...state,
                    retryCount: 0,
                }));
            },

            // === Force State Sync ===
            syncWithElement: () => {
                const { audioElement } = get();
                if (!audioElement) return;

                try {
                    const isPlaying = !audioElement.paused && !audioElement.ended;
                    const isPaused = audioElement.paused && !audioElement.ended;
                    const currentTime = (audioElement.currentTime || 0) * 1000;
                    const duration = (audioElement.duration || 0) * 1000;
                    const isReady = audioElement.readyState >= 2; // HAVE_CURRENT_DATA or higher

                    set((state) => ({
                        ...state,
                        isPlaying,
                        isPaused,
                        currentTime,
                        duration,
                        isReady,
                    }));
                } catch (error) {
                    console.error('Error syncing with audio element:', error);
                }
            },

            // === Health Check ===
            healthCheck: () => {
                const { audioElement, isReady } = get();

                if (!audioElement) {
                    return { status: 'no-element', message: 'No audio element' };
                }

                if (audioElement.error) {
                    return {
                        status: 'error',
                        message: `Audio error: ${audioElement.error.message}`,
                        code: audioElement.error.code
                    };
                }

                if (!isReady) {
                    return {
                        status: 'not-ready',
                        message: `Audio not ready (readyState: ${audioElement.readyState})`
                    };
                }

                if (!audioElement.src) {
                    return { status: 'no-src', message: 'No audio source' };
                }

                return { status: 'healthy', message: 'Audio element is healthy' };
            },
        })),
        {
            name: 'audio-store',
            serialize: {
                options: {
                    map: true,
                },
            },
        }
    )
);

// === Selectors for Performance ===
export const audioSelectors = {
    // State selectors
    playbackState: (store: AudioStore) => ({
        isPlaying: store.isPlaying,
        isPaused: store.isPaused,
        isLoading: store.isLoading,
        isReady: store.isReady,
    }),

    audioProperties: (store: AudioStore) => ({
        volume: store.volume,
        muted: store.muted,
        currentTime: store.currentTime,
        duration: store.duration,
    }),

    errorState: (store: AudioStore) => ({
        error: store.error,
        retryCount: store.retryCount,
    }),

    // Computed selectors
    canPlay: (store: AudioStore) => {
        // 오디오가 준비되고 엘리먼트가 있으면 재생 가능
        // 자동재생 정책으로 인한 에러는 사용자 상호작용으로 해결 가능하므로 canPlay = true
        return store.isReady && !!store.audioElement && (
            !store.error ||
            store.error.includes('autoplay blocked') ||
            store.error.includes('NotAllowedError')
        );
    },

    hasError: (store: AudioStore) => !!store.error,
    isBuffering: (store: AudioStore) => store.isLoading && !store.error,
    canRetry: (store: AudioStore) => !!store.error && store.retryCount < MAX_RETRIES,

    // Individual state properties
    isPlaying: (store: AudioStore) => store.isPlaying,
    isReady: (store: AudioStore) => store.isReady,
    volume: (store: AudioStore) => store.volume,
    muted: (store: AudioStore) => store.muted,
    currentTime: (store: AudioStore) => store.currentTime,
    duration: (store: AudioStore) => store.duration,
    error: (store: AudioStore) => store.error,
    audioElement: (store: AudioStore) => store.audioElement,
};