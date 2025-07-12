'use client';

import { ConferencePlayerData, PlayerActions, PlayerState } from '@/types/conference-player';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Loader2,
    Pause,
    Play,
    SkipBack,
    SkipForward,
    Volume2
} from 'lucide-react';
import { FC, useCallback, useEffect, useState } from 'react';

interface Props {
    data: ConferencePlayerData;
    playerState: PlayerState;
    actions: PlayerActions;
    isFirstSection: boolean;
    isLastSection: boolean;
    canPlay: boolean;
    isAudioReady: boolean;
    needsUserInteraction?: boolean;
}

export const PlayerControls: FC<Props> = ({
    playerState,
    actions,
    isFirstSection,
    isLastSection,
    canPlay,
    isAudioReady,
    needsUserInteraction = false
}) => {
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);

    const handleTogglePlayPause = useCallback(async () => {
        setIsActionLoading(true);

        try {
            await actions.togglePlayPause();

            // 첫 번째 사용자 상호작용 후 자동재생 프롬프트 숨기기
            if (showAutoplayPrompt) {
                setShowAutoplayPrompt(false);
            }
        } catch (error) {
            console.error('Toggle play/pause failed:', error);
        } finally {
            setIsActionLoading(false);
        }
    }, [actions, showAutoplayPrompt]);

    const handlePrevious = useCallback(() => {
        if (!isFirstSection) {
            actions.goToPrevious();
        }
    }, [actions, isFirstSection]);

    const handleNext = useCallback(() => {
        if (!isLastSection) {
            actions.goToNext();
        }
    }, [actions, isLastSection]);

    // 자동재생이 차단되었을 때 사용자에게 알림 표시
    useEffect(() => {
        if (needsUserInteraction && isAudioReady && !playerState.isPlaying) {
            setShowAutoplayPrompt(true);
        } else {
            setShowAutoplayPrompt(false);
        }
    }, [needsUserInteraction, isAudioReady, playerState.isPlaying]);

    // 자동재생 프롬프트를 위한 컴포넌트
    const AutoplayPrompt = () => (
        <motion.div
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-red-400" />
                <span className="text-sm">재생 버튼을 클릭하여 시작하세요</span>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
        </motion.div>
    );

    // 재생 가능 조건을 더 관대하게 설정
    const isPlayable = isAudioReady && (canPlay || needsUserInteraction);

    return (
        <motion.div
            className="px-6 pb-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
        >
            {/* 자동재생 프롬프트 */}
            <AnimatePresence>
                {showAutoplayPrompt && (
                    <AutoplayPrompt />
                )}
            </AnimatePresence>

            <div className="flex items-center justify-center space-x-8">
                {/* Previous */}
                <motion.button
                    onClick={handlePrevious}
                    disabled={isFirstSection}
                    className="p-3 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: isFirstSection ? 1 : 1.05 }}
                    whileTap={{ scale: isFirstSection ? 1 : 0.95 }}
                    aria-label="이전"
                >
                    <SkipBack className="w-6 h-6 text-gray-300" />
                </motion.button>

                {/* Play/Pause */}
                <motion.button
                    onClick={handleTogglePlayPause}
                    disabled={!isPlayable || isActionLoading}
                    className={`
                        relative p-4 rounded-full shadow-lg transition-all duration-200
                        ${isPlayable && !isActionLoading
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }
                        ${showAutoplayPrompt ? 'animate-pulse' : ''}
                    `}
                    whileHover={isPlayable && !isActionLoading ? { scale: 1.05 } : {}}
                    whileTap={isPlayable && !isActionLoading ? { scale: 0.95 } : {}}
                    aria-label={playerState.isPlaying ? "일시정지" : "재생"}
                >
                    <AnimatePresence mode="wait">
                        {isActionLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </motion.div>
                        ) : playerState.isPlaying ? (
                            <motion.div
                                key="pause"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Pause className="w-6 h-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="play"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Play className="w-6 h-6 ml-0.5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* Next */}
                <motion.button
                    onClick={handleNext}
                    disabled={isLastSection}
                    className="p-3 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: isLastSection ? 1 : 1.05 }}
                    whileTap={{ scale: isLastSection ? 1 : 0.95 }}
                    aria-label="다음"
                >
                    <SkipForward className="w-6 h-6 text-gray-300" />
                </motion.button>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
                {!isAudioReady && (
                    <motion.div
                        className="text-center mt-4 text-sm text-gray-500"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>오디오를 로딩 중...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};