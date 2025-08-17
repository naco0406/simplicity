'use client';

import { ConferenceData } from '@/types/conference';
import { PlayerState } from '@/types/conference-player';
import { IntroSection as IntroSectionType } from '@/types/conference-section';
import { generateAvatarGradient } from '@/utils/color-utils';
import { useIsMobile } from '@/utils/mobile-utils';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';

interface Props {
    data: ConferenceData;
    section: IntroSectionType;
    playerState: PlayerState;
}

export const IntroSection: FC<Props> = ({
    data: conference,
    // section,
    // playerState
}) => {
    const isMobile = useIsMobile();
    
    // 혹시 몰라서 일단 가지고 있는 정보
    // const sectionTime = playerState.currentTime - section.startTime;
    // const progress = Math.min(100, Math.max(0, (sectionTime / section.duration) * 100));

    return (
        <div className={`text-center ${
            isMobile 
                ? 'px-4 py-4 mt-8' 
                : 'px-8 py-6 mt-16'
        }`}>
            <div className="max-w-5xl mx-auto">
                <motion.div
                    className={isMobile ? 'mb-32' : 'mb-64'}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <AnimatePresence mode="wait">
                        {conference.subtitle && (
                            <motion.h2
                                className={`font-bold text-gray-300 mb-2 leading-relaxed ${
                                    isMobile ? 'text-base' : 'text-xl'
                                }`}
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
                        className={`font-bold mb-6 leading-tight tracking-tight whitespace-pre-line ${
                            isMobile 
                                ? 'text-3xl sm:text-4xl' 
                                : 'text-6xl'
                        }`}
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
                    className={`opacity-90 ${isMobile ? 'mb-6' : 'mb-8'}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
                >
                    <div className={`flex items-center justify-center mb-4 ${
                        isMobile ? 'space-x-3' : 'space-x-4'
                    }`}>
                        <motion.div
                            className={`rounded-full flex items-center justify-center shadow-lg ${
                                isMobile ? 'w-12 h-12' : 'w-16 h-16'
                            }`}
                            style={generateAvatarGradient(conference.color)}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 200 }}
                        >
                            <span className={`font-bold text-white ${
                                isMobile ? 'text-lg' : 'text-2xl'
                            }`}>
                                {conference.speaker.split(' ').map(name => name[0]).join('')}
                            </span>
                        </motion.div>
                        <motion.div
                            className="text-left"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <h3 
                                className={`font-semibold mb-1 ${
                                    isMobile ? 'text-lg' : 'text-xl'
                                }`}
                                style={{ color: conference.color }}
                            >
                                {conference.speaker}
                            </h3>
                            <p className={`text-gray-400 ${
                                isMobile ? 'text-xs' : 'text-sm'
                            }`}>
                                {conference.role}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};