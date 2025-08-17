'use client';

import { PlayerActions, PlayerState } from '@/types/conference-player';
import { ClosingSection as ClosingSectionType } from '@/types/conference-section';
import { DEFAULT_COLOR } from '@/utils/constants';
import { useIsMobile } from '@/utils/mobile-utils';
import { motion } from 'framer-motion';
import { FC } from 'react';

interface Props {
    section: ClosingSectionType;
    playerState: PlayerState;
    actions: PlayerActions;
    conferenceColor?: string;
}

export const ClosingSection: FC<Props> = ({
    section,
    playerState,
    conferenceColor = DEFAULT_COLOR
}) => {
    const isMobile = useIsMobile();
    const sectionTime = playerState.currentTime - section.startTime;
    const progress = Math.min(100, Math.max(0, (sectionTime / section.duration) * 100));

    return (
        <div className={`flex-1 flex flex-col justify-center items-center ${
            isMobile ? 'px-4 py-6' : 'px-8 py-12'
        }`}>
            <div className="w-full max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className={isMobile ? 'mb-6' : 'mb-8'}
                >
                    <motion.h1
                        className={`font-bold mb-6 leading-tight tracking-tight ${
                            isMobile 
                                ? 'text-2xl sm:text-3xl' 
                                : 'text-4xl md:text-5xl lg:text-6xl'
                        }`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                    >
                        <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                            {section.message}
                        </span>
                    </motion.h1>
                </motion.div>

                {/* Credits */}
                {section.credits && section.credits.length > 0 && (
                    <motion.div
                        className="text-gray-400"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <div className="space-y-2">
                            {section.credits.map((credit, index) => (
                                <motion.p
                                    key={index}
                                    className={isMobile ? 'text-xs' : 'text-sm'}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                                >
                                    {credit}
                                </motion.p>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Completion indicator */}
                {progress >= 100 && (
                    <motion.div
                        className={isMobile ? 'mt-6' : 'mt-8'}
                        style={{ color: conferenceColor }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <div
                                className={`rounded-full ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`}
                                style={{ backgroundColor: conferenceColor }}
                            />
                            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>완료</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};