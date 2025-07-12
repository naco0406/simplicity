import { audioSelectors, useAudioStore } from '@/stores/audio-store';
import { playerSelectors, usePlayerStore } from '@/stores/conference-player-store';
import { Conference } from '@/types/conference';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
    conference: Conference;
}

/**
 * 모든 섹션을 동일하게 처리
 * 오디오 로딩 및 자동재생 로직
 */
export const useConferencePlayer = ({ conference }: Props) => {
    const hasAutoStarted = useRef(false);
    const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
    const initializationTimeout = useRef<NodeJS.Timeout | null>(null);
    const retryTimeout = useRef<NodeJS.Timeout | null>(null);

    // === Store State ===
    const playerState = usePlayerStore(playerSelectors.playerState);
    const currentSection = usePlayerStore(playerSelectors.currentSection);
    const isFirstSection = usePlayerStore(playerSelectors.isFirstSection);
    const isLastSection = usePlayerStore(playerSelectors.isLastSection);
    const autoPlayEnabled = usePlayerStore(playerSelectors.autoPlayEnabled);

    const isAudioReady = useAudioStore(audioSelectors.isReady);
    const isAudioPlaying = useAudioStore(audioSelectors.isPlaying);
    const canPlay = useAudioStore(audioSelectors.canPlay);
    const audioError = useAudioStore(audioSelectors.error);
    const audioElement = useAudioStore(audioSelectors.audioElement);

    // === Store Actions ===
    const {
        initialize,
        updatePlayerState,
        seekToTime,
        goToNext,
        goToPrevious,
        seekToSection,
        seekToSentence,
        setAutoPlayEnabled
    } = usePlayerStore();

    const {
        play,
        pause,
        seekTo,
        clearError,
        syncWithElement,
        healthCheck
    } = useAudioStore();

    // === Initialize Player ===
    useEffect(() => {
        initialize(conference);

        // Clear any previous timeouts
        if (initializationTimeout.current) {
            clearTimeout(initializationTimeout.current);
        }
        if (retryTimeout.current) {
            clearTimeout(retryTimeout.current);
        }

        return () => {
            if (initializationTimeout.current) {
                clearTimeout(initializationTimeout.current);
            }
            if (retryTimeout.current) {
                clearTimeout(retryTimeout.current);
            }
        };
    }, [conference.data.id, conference.playerData.id, initialize]);

    // === Enhanced Auto-start Logic ===
    useEffect(() => {
        if (hasAutoStarted.current) return;

        const attemptAutoStart = async () => {
            // Check if all conditions are met
            if (!isAudioReady || !canPlay || !autoPlayEnabled || !audioElement) {
                return;
            }

            // Perform health check
            const health = healthCheck();
            if (health.status !== 'healthy') {
                console.warn('Audio health check failed:', health.message);
                return;
            }
            hasAutoStarted.current = true;

            try {
                // Start from the beginning
                seekToTime(0);

                // Small delay to ensure seek is processed
                await new Promise(resolve => setTimeout(resolve, 100));

                // Sync audio position
                seekTo(0);

                // Another small delay before play
                await new Promise(resolve => setTimeout(resolve, 50));

                await play();
                updatePlayerState({ isPlaying: true });

            } catch (error) {
                console.error('Conference auto-play failed:', error);
                updatePlayerState({ isPlaying: false });

                // If autoplay failed due to browser policy, mark as needing user interaction
                if (error instanceof Error && error.name === 'NotAllowedError') {
                    setNeedsUserInteraction(true);
                    // Don't disable autoplay, just wait for user interaction
                }
            }
        };

        // Set a timeout to attempt auto-start
        initializationTimeout.current = setTimeout(attemptAutoStart, 200);

    }, [
        isAudioReady,
        canPlay,
        autoPlayEnabled,
        audioElement,
        seekToTime,
        seekTo,
        play,
        updatePlayerState,
        setAutoPlayEnabled,
        healthCheck
    ]);

    // === Audio/Player State Sync ===
    useEffect(() => {
        if (playerState.isPlaying !== isAudioPlaying) {
            updatePlayerState({ isPlaying: isAudioPlaying });
        }
    }, [playerState.isPlaying, isAudioPlaying, updatePlayerState]);

    // === Audio Time Sync with Improved Logic ===
    useEffect(() => {
        if (!isAudioPlaying || !isAudioReady || !audioElement) return;

        const syncInterval = setInterval(() => {
            try {
                const audioTime = audioElement.currentTime * 1000; // Convert to ms
                const timeDiff = Math.abs(audioTime - playerState.currentTime);

                // Update player time if there's a significant difference (more than 20ms)
                if (timeDiff > 20) {
                    seekToTime(audioTime);
                }
            } catch (error) {
                console.error('Error during time sync:', error);
            }
        }, 10); // Check every 10ms for better performance

        return () => clearInterval(syncInterval);
    }, [isAudioPlaying, isAudioReady, audioElement, playerState.currentTime, seekToTime]);

    // === Error Recovery ===
    useEffect(() => {
        if (audioError) {
            console.error('Audio error detected:', audioError);
            updatePlayerState({ isPlaying: false });

            // Check if it's an autoplay policy error
            if (audioError.includes('autoplay blocked') || audioError.includes('NotAllowedError')) {
                setNeedsUserInteraction(true);
            }

            // Attempt recovery for network errors
            if (audioError.includes('Network') || audioError.includes('timeout')) {
                retryTimeout.current = setTimeout(() => {
                    clearError();
                    if (audioElement) {
                        syncWithElement();
                    }
                }, 2000);
            }
        }
    }, [audioError, updatePlayerState, clearError, syncWithElement, audioElement]);

    // === Enhanced Actions with Better Error Handling ===
    const togglePlayPause = useCallback(async () => {

        // Perform health check first
        const health = healthCheck();
        if (health.status !== 'healthy') {
            console.error('Cannot toggle play/pause - health check failed:', health.message);
            return;
        }

        try {
            if (playerState.isPlaying) {
                pause();
                updatePlayerState({ isPlaying: false });
            } else {
                // 사용자 상호작용이 발생했으므로 자동재생 정책 문제 해결
                if (needsUserInteraction) {
                    setNeedsUserInteraction(false);
                }

                // Sync audio position before playing
                const currentTime = playerState.currentTime;
                seekTo(currentTime);

                // Small delay to ensure seek is processed
                await new Promise(resolve => setTimeout(resolve, 50));

                await play();
                updatePlayerState({ isPlaying: true });
                setAutoPlayEnabled(true); // 사용자가 재생하면 자동재생 활성화
            }
        } catch (error) {
            console.error('Toggle play/pause failed:', error);
            updatePlayerState({ isPlaying: false });

            // Handle specific error types
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    console.warn('Play blocked by browser policy');
                    setNeedsUserInteraction(true);
                } else if (error.name === 'NotSupportedError') {
                    console.error('Audio format not supported');
                }
            }
        }
    }, [
        playerState.isPlaying,
        playerState.currentTime,
        pause,
        updatePlayerState,
        setAutoPlayEnabled,
        seekTo,
        play,
        healthCheck
    ]);

    const enhancedGoToNext = useCallback(() => {
        const wasPlaying = playerState.isPlaying;

        try {
            if (wasPlaying) {
                pause();
            }

            goToNext();

            if (wasPlaying && autoPlayEnabled) {
                setTimeout(async () => {
                    try {
                        const newCurrentTime = usePlayerStore.getState().playerState.currentTime;
                        seekTo(newCurrentTime);
                        await new Promise(resolve => setTimeout(resolve, 50));

                        await play();
                        updatePlayerState({ isPlaying: true });
                    } catch (error) {
                        console.error('Failed to resume playback after next:', error);
                        updatePlayerState({ isPlaying: false });
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Go to next failed:', error);
        }
    }, [playerState.isPlaying, autoPlayEnabled, pause, goToNext, seekTo, play, updatePlayerState]);

    const enhancedGoToPrevious = useCallback(() => {
        const wasPlaying = playerState.isPlaying;

        try {
            if (wasPlaying) {
                pause();
            }

            goToPrevious();

            if (wasPlaying && autoPlayEnabled) {
                setTimeout(async () => {
                    try {
                        const newCurrentTime = usePlayerStore.getState().playerState.currentTime;
                        seekTo(newCurrentTime);
                        await new Promise(resolve => setTimeout(resolve, 50));

                        await play();
                        updatePlayerState({ isPlaying: true });
                    } catch (error) {
                        console.error('Failed to resume playback after previous:', error);
                        updatePlayerState({ isPlaying: false });
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Go to previous failed:', error);
        }
    }, [playerState.isPlaying, autoPlayEnabled, pause, goToPrevious, seekTo, play, updatePlayerState]);

    const enhancedSeekToSection = useCallback((sectionIndex: number) => {
        const wasPlaying = playerState.isPlaying;

        try {
            if (wasPlaying) {
                pause();
            }

            seekToSection(sectionIndex);

            if (wasPlaying && autoPlayEnabled) {
                setTimeout(async () => {
                    try {
                        const newCurrentTime = usePlayerStore.getState().playerState.currentTime;
                        seekTo(newCurrentTime);
                        await new Promise(resolve => setTimeout(resolve, 50));

                        await play();
                        updatePlayerState({ isPlaying: true });
                    } catch (error) {
                        console.error('Failed to resume playback after section seek:', error);
                        updatePlayerState({ isPlaying: false });
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Seek to section failed:', error);
        }
    }, [playerState.isPlaying, autoPlayEnabled, pause, seekToSection, seekTo, play, updatePlayerState]);

    const enhancedSeekToSentence = useCallback((sentenceIndex: number) => {
        const wasPlaying = playerState.isPlaying;

        try {
            seekToSentence(sentenceIndex);

            if (wasPlaying && autoPlayEnabled) {
                setTimeout(async () => {
                    try {
                        const newCurrentTime = usePlayerStore.getState().playerState.currentTime;
                        seekTo(newCurrentTime);
                        await new Promise(resolve => setTimeout(resolve, 50));

                        await play();
                        updatePlayerState({ isPlaying: true });
                    } catch (error) {
                        console.error('Failed to resume playback after sentence seek:', error);
                        updatePlayerState({ isPlaying: false });
                    }
                }, 50);
            }
        } catch (error) {
            console.error('Seek to sentence failed:', error);
        }
    }, [seekToSentence, playerState.isPlaying, autoPlayEnabled, seekTo, play, updatePlayerState]);

    // === Cleanup ===
    useEffect(() => {
        return () => {
            hasAutoStarted.current = false;
            setNeedsUserInteraction(false);
            if (initializationTimeout.current) {
                clearTimeout(initializationTimeout.current);
            }
            if (retryTimeout.current) {
                clearTimeout(retryTimeout.current);
            }
        };
    }, []);

    return {
        // State
        playerState,
        currentSection,
        isFirstSection,
        isLastSection,
        autoPlayEnabled,
        isAudioReady,
        canPlay,
        needsUserInteraction,

        // Actions
        togglePlayPause,
        goToNext: enhancedGoToNext,
        goToPrevious: enhancedGoToPrevious,
        seekToSection: enhancedSeekToSection,
        seekToSentence: enhancedSeekToSentence,
        seekToTime,
        setAutoPlayEnabled,
    };
};