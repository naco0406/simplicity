'use client';

import { PlayerActions, PlayerState } from '@/types/conference-player';
import { ClosingSection as ClosingSectionType } from '@/types/conference-section';
import { motion } from 'framer-motion';
import { FC } from 'react';

interface Props {
    section: ClosingSectionType;
    playerState: PlayerState;
    actions: PlayerActions;
}

export const ClosingSection: FC<Props> = ({
    section,
    playerState,
}) => {
    const sectionTime = playerState.currentTime - section.startTime;
    const progress = Math.min(100, Math.max(0, (sectionTime / section.duration) * 100));

    return (
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
            <div className="w-full max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="mb-8"
                >
                    <motion.h1
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                    >
                        <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                            {section.message}
                        </span>
                    </motion.h1>

                    {/* Progress indication */}
                    {playerState.isPlaying && (
                        <motion.div
                            className="w-32 h-1 bg-gray-700 rounded-full mx-auto mb-8 overflow-hidden"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </motion.div>
                    )}
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
                                    className="text-sm"
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
                        className="mt-8 text-green-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full" />
                            <span className="text-sm font-medium">완료</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};