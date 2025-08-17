'use client';

import { ConferencePlayerData, PlayerActions, PlayerState } from '@/types/conference-player';
import { generateButtonGradient } from '@/utils/color-utils';
import { DEFAULT_COLOR, TOUCH_TARGET } from '@/utils/constants';
import { useIsMobile } from '@/utils/mobile-utils';
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
    conferenceColor?: string;
}

export const PlayerControls: FC<Props> = ({
    playerState,
    actions,
    isFirstSection,
    isLastSection,
    canPlay,
    isAudioReady,
    needsUserInteraction = false,
    conferenceColor = DEFAULT_COLOR
}) => {
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
    const isMobile = useIsMobile();

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
            className={`
                absolute left-1/2 transform -translate-x-1/2 
                bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-10
                ${isMobile ? '-top-10 text-xs' : '-top-12'}
            `}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4" style={{ color: conferenceColor }} />
                <span>재생 버튼을 클릭하여 시작하세요</span>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
        </motion.div>
    );

    // 재생 가능 조건을 더 관대하게 설정
    const isPlayable = isAudioReady && (canPlay || needsUserInteraction);

    // 모바일에 최적화된 버튼 크기와 간격
    const controlButtonSize = isMobile ? TOUCH_TARGET.COMFORTABLE_SIZE : 48;
    const playButtonSize = isMobile ? TOUCH_TARGET.LARGE_SIZE : 64;
    const buttonSpacing = isMobile ? 'space-x-4 sm:space-x-6' : 'space-x-8';

    return (
        <motion.div
            className={`relative ${isMobile ? 'px-4 pb-4' : 'px-6 pb-6'}`}
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

            <div className={`flex items-center justify-center ${buttonSpacing}`}>
                {/* Previous */}
                <motion.button
                    onClick={handlePrevious}
                    disabled={isFirstSection || showAutoplayPrompt}
                    className={`
                        rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed 
                        transition-all duration-200 flex items-center justify-center
                        ${isMobile ? 'active:scale-95' : ''}
                    `}
                    style={{
                        width: `${controlButtonSize}px`,
                        height: `${controlButtonSize}px`,
                        minWidth: `${TOUCH_TARGET.MIN_SIZE}px`,
                        minHeight: `${TOUCH_TARGET.MIN_SIZE}px`,
                    }}
                    whileHover={{ scale: isFirstSection ? 1 : 1.05 }}
                    whileTap={{ scale: isFirstSection ? 1 : 0.95 }}
                    aria-label="이전"
                >
                    <SkipBack className={`text-gray-300 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                </motion.button>

                {/* Play/Pause */}
                <motion.button
                    onClick={handleTogglePlayPause}
                    disabled={!isPlayable || isActionLoading}
                    className={`
                        relative rounded-full shadow-lg transition-all duration-200 
                        flex items-center justify-center
                        ${isPlayable && !isActionLoading
                            ? 'text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }
                        ${showAutoplayPrompt ? 'animate-pulse' : ''}
                        ${isMobile ? 'active:scale-95' : ''}
                    `}
                    style={{
                        width: `${playButtonSize}px`,
                        height: `${playButtonSize}px`,
                        minWidth: `${TOUCH_TARGET.MIN_SIZE}px`,
                        minHeight: `${TOUCH_TARGET.MIN_SIZE}px`,
                        ...(isPlayable && !isActionLoading ? generateButtonGradient(conferenceColor) : {})
                    }}
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
                                <Loader2 className={`animate-spin ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                            </motion.div>
                        ) : playerState.isPlaying ? (
                            <motion.div
                                key="pause"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Pause className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="play"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Play className={`ml-0.5 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* Next */}
                <motion.button
                    onClick={handleNext}
                    disabled={isLastSection || showAutoplayPrompt}
                    className={`
                        rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed 
                        transition-all duration-200 flex items-center justify-center
                        ${isMobile ? 'active:scale-95' : ''}
                    `}
                    style={{
                        width: `${controlButtonSize}px`,
                        height: `${controlButtonSize}px`,
                        minWidth: `${TOUCH_TARGET.MIN_SIZE}px`,
                        minHeight: `${TOUCH_TARGET.MIN_SIZE}px`,
                    }}
                    whileHover={{ scale: isLastSection ? 1 : 1.05 }}
                    whileTap={{ scale: isLastSection ? 1 : 0.95 }}
                    aria-label="다음"
                >
                    <SkipForward className={`text-gray-300 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                </motion.button>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
                {!isAudioReady && (
                    <motion.div
                        className={`text-center mt-4 text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}
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