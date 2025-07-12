'use client';

import { ConferenceData } from '@/types/conference';
import { PlayerState } from '@/types/conference-player';
import { IntroSection as IntroSectionType } from '@/types/conference-section';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';

interface Props {
    data: ConferenceData;
    section: IntroSectionType;
    playerState: PlayerState;
}

export const IntroSection: FC<Props> = ({
    data: conference,
    section,
    playerState
}) => {
    const sectionTime = playerState.currentTime - section.startTime;
    // const progress = Math.min(100, Math.max(0, (sectionTime / section.duration) * 100));

    return (
        <div className="px-8 py-6 mt-16">
            <div className="max-w-5xl mx-auto text-center">
                <motion.div
                    className="mb-64"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <AnimatePresence mode="wait">
                        {conference.subtitle && (
                            <motion.h2
                                className="text-xl font-bold text-gray-300 mb-2 leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                {conference.subtitle}
                            </motion.h2>
                        )}
                    </AnimatePresence>
                    <motion.h1
                        className="text-6xl font-bold mb-6 leading-tight tracking-tight whitespace-pre-line"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                    >
                        <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                            {conference.title}
                        </span>
                    </motion.h1>
                </motion.div>

                <motion.div
                    className="mb-8 opacity-90"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
                >
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <motion.div
                            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 200 }}
                        >
                            <span className="text-2xl font-bold text-white">
                                {conference.speaker.split(' ').map(name => name[0]).join('')}
                            </span>
                        </motion.div>
                        <motion.div
                            className="text-left"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <h3 className="text-xl font-semibold text-blue-300 mb-1">
                                {conference.speaker}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {conference.role}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};