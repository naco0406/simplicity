'use client';

import { useConferencePlayer } from '@/hooks/useConferencePlayer';
import { useAudioStore, usePlayerStore } from '@/stores';
import { Conference } from '@/types/conference';
import { isClosingSection, isContentSection, isIntroSection } from '@/types/conference-section';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ClosingSection } from '../section/ClosingSection';
import { ContentSection } from '../section/ContentSection';
import { IntroSection } from '../section/IntroSection';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { MAX_RETRIES } from '@/utils/constants';

interface Props extends Conference {
    className?: string;
}

export const ConferencePlayer: FC<Props> = ({
    data,
    playerData,
    className = ''
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioLoadError, setAudioLoadError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isPreloading, setIsPreloading] = useState(true);


    // === Unified Player Hook ===
    const {
        playerState,
        currentSection,
        isFirstSection,
        isLastSection,
        isAudioReady,
        canPlay,
        needsUserInteraction,
        togglePlayPause,
        goToNext,
        goToPrevious,
        seekToSection,
        seekToSentence,
        seekToTime,
        setAutoPlayEnabled,
    } = useConferencePlayer({ conference: { data, playerData } });

    // === Audio Management ===
    const { setAudioElement, clearError } = useAudioStore();

    // === Audio Element Setup with Retry Logic ===
    const setupAudioElement = useCallback(async () => {
        const audioElement = audioRef.current;
        if (!audioElement || !playerData.srcUrl) {
            console.warn('Audio element or src URL not available');
            return false;
        }

        try {
            // Reset audio element
            audioElement.pause();
            audioElement.currentTime = 0;
            audioElement.src = '';

            // Clear any previous errors
            clearError();
            setAudioLoadError(null);

            // Set new source
            audioElement.src = playerData.srcUrl;
            audioElement.preload = 'auto';
            audioElement.crossOrigin = 'anonymous';

            // Additional audio settings for better compatibility
            audioElement.muted = false;
            audioElement.volume = 1.0;

            // Force load
            audioElement.load();

            // Wait for the audio to be ready
            return new Promise<boolean>((resolve) => {
                const cleanup = () => {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
                    audioElement.removeEventListener('loadeddata', onLoadedData);
                    audioElement.removeEventListener('error', onError);
                };

                const onCanPlayThrough = () => {
                    cleanup();
                    setAudioElement(audioElement);
                    setIsPreloading(false);
                    resolve(true);
                };

                const onLoadedData = () => {
                    // Additional check to ensure audio is really ready
                    if (audioElement.readyState >= 2) { // HAVE_CURRENT_DATA
                        cleanup();
                        setAudioElement(audioElement);
                        setIsPreloading(false);
                        resolve(true);
                    }
                };

                const onError = (e: Event) => {
                    console.error('Audio loading error:', e);
                    cleanup();
                    resolve(false);
                };

                // Set up event listeners
                audioElement.addEventListener('canplaythrough', onCanPlayThrough, { once: true });
                audioElement.addEventListener('loadeddata', onLoadedData, { once: true });
                audioElement.addEventListener('error', onError, { once: true });

                // Set timeout for retry
                const timeoutId = setTimeout(() => {
                    console.warn('Audio loading timeout');
                    cleanup();
                    resolve(false);
                }, 10000);
            });

        } catch (error) {
            console.error('Error setting up audio element:', error);
            return false;
        }
    }, [playerData.srcUrl, setAudioElement, clearError]);

    // === Audio Setup with Retry Logic ===
    useEffect(() => {
        let isMounted = true;

        const initializeAudio = async () => {
            if (!playerData.srcUrl) {
                console.warn('No audio source URL provided');
                return;
            }

            setIsPreloading(true);
            setAudioLoadError(null);

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                if (!isMounted) break;

                const success = await setupAudioElement();

                if (success) {
                    setRetryCount(0);
                    return;
                }

                if (attempt < MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
                }
            }

            // All retries failed
            if (isMounted) {
                console.error('Failed to setup audio after all retries');
                setAudioLoadError('오디오를 로드할 수 없습니다. 네트워크 연결을 확인해주세요.');
                setIsPreloading(false);
                setRetryCount(MAX_RETRIES);
            }
        };

        initializeAudio();

        return () => {
            isMounted = false;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            setAudioElement(null);
        };
    }, [playerData.srcUrl, setupAudioElement, setAudioElement]);

    // === Manual Retry Function ===
    const handleRetryAudio = useCallback(async () => {
        setRetryCount(0);
        setAudioLoadError(null);
        setIsPreloading(true);

        const success = await setupAudioElement();
        if (!success) {
            setAudioLoadError('오디오 로드에 실패했습니다. 다시 시도해주세요.');
            setIsPreloading(false);
        }
    }, [setupAudioElement]);

    // === Error Handling ===
    if (!currentSection) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-black text-white ${className}`}>
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 className="text-xl font-semibold text-red-400 mb-2">오류</h2>
                    <p className="text-gray-400">잘못된 섹션입니다. (섹션 {playerState.currentSectionIndex})</p>
                    <p className="text-gray-500 text-sm mt-2">총 {playerData.sections.length}개 섹션 중</p>
                </motion.div>
            </div>
        );
    }

    // === Audio Loading Error UI ===
    if (audioLoadError) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-black text-white ${className}`}>
                <motion.div
                    className="text-center max-w-md px-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 className="text-xl font-semibold text-red-400 mb-4">오디오 로드 실패</h2>
                    <p className="text-gray-400 mb-6">{audioLoadError}</p>
                    <button
                        onClick={handleRetryAudio}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                    >
                        다시 시도
                    </button>
                </motion.div>
            </div>
        );
    }

    // === Player Actions Object ===
    const playerActions = {
        togglePlayPause,
        goToPrevious,
        goToNext,
        seekToSection,
        seekToSentence,
        seekToTime,
        setAutoPlayEnabled,
    };

    // 컨트롤 활성화 상태 계산
    const controlsEnabled = canPlay && !isPreloading;
    const audioFullyReady = isAudioReady && !isPreloading;

    return (
        <div className={`w-full h-full flex flex-col bg-black text-white ${className}`}>
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                preload="auto"
                crossOrigin="anonymous"
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    opacity: 0,
                    pointerEvents: 'none'
                }}
                onLoadedMetadata={() => {
                    console.log('Audio metadata loaded');
                    usePlayerStore.getState().updatePlayerState({ srcReady: true });
                }}
                onCanPlay={() => {
                    console.log('Audio can play');
                    usePlayerStore.getState().updatePlayerState({ srcReady: true });
                }}
                onCanPlayThrough={() => {
                    console.log('Audio can play through');
                    usePlayerStore.getState().updatePlayerState({ srcReady: true });
                }}
                onError={(error) => {
                    console.error('Audio loading error:', error);
                    usePlayerStore.getState().updatePlayerState({ srcReady: false });
                }}
                onEnded={() => {
                    console.log('Audio ended');
                    usePlayerStore.getState().updatePlayerState({ isPlaying: false });
                }}
            />

            {/* Loading Overlay */}
            {isPreloading && (
                <motion.div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-300">오디오를 준비하는 중...</p>
                        {retryCount > 0 && (
                            <p className="text-gray-500 text-sm mt-2">
                                시도 {retryCount + 1}/{MAX_RETRIES}
                            </p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Progress Bar */}
            <ProgressBar
                section={currentSection}
                playerState={playerState}
                sectionIndex={playerState.currentSectionIndex}
                totalSections={playerData.sections.length}
            />

            {/* Main Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`section-${playerState.currentSectionIndex}-${currentSection.type}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 flex flex-col"
                >
                    {isIntroSection(currentSection) ? (
                        <IntroSection
                            data={data}
                            section={currentSection}
                            playerState={playerState}
                        />
                    ) : isContentSection(currentSection) ? (
                        <ContentSection
                            section={currentSection}
                            playerState={playerState}
                            actions={playerActions}
                        />
                    ) : isClosingSection(currentSection) ? (
                        <ClosingSection
                            section={currentSection}
                            playerState={playerState}
                            actions={playerActions}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-400">알 수 없는 섹션 타입</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <PlayerControls
                data={playerData}
                playerState={playerState}
                actions={playerActions}
                isFirstSection={isFirstSection}
                isLastSection={isLastSection}
                canPlay={controlsEnabled}
                isAudioReady={audioFullyReady}
                needsUserInteraction={needsUserInteraction}
            />
        </div>
    );
};