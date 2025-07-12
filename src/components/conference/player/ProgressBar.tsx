'use client';

import { playerSelectors, usePlayerStore } from '@/stores/conference-player-store';
import { PlayerState } from '@/types/conference-player';
import { isContentSection, Section } from '@/types/conference-section';
import { motion } from 'framer-motion';
import { FC, useMemo } from 'react';

interface Props {
    section: Section;
    playerState: PlayerState;
    sectionIndex: number;
    totalSections: number;
}

export const ProgressBar: FC<Props> = ({
    section,
    playerState,
    sectionIndex,
    totalSections
}) => {
    // === Overall Progress ===
    const overallProgress = usePlayerStore(playerSelectors.overallProgress);
    const sectionProgress = usePlayerStore(playerSelectors.sectionProgress);

    // === Sentence Progress for Content Sections ===
    const sentenceProgresses = useMemo(() => {
        if (!isContentSection(section) || playerState.currentSectionIndex !== sectionIndex) {
            return [];
        }

        const sectionTime = playerState.currentTime - section.startTime;

        return section.sentences.map((sentence, index) => {
            if (index < playerState.currentSentenceIndex) {
                return 100;
            } else if (index === playerState.currentSentenceIndex) {
                const sentenceElapsed = Math.max(0, sectionTime - sentence.startTime);
                const sentenceDuration = sentence.endTime - sentence.startTime;
                return Math.min(100, (sentenceElapsed / sentenceDuration) * 100);
            } else {
                return 0;
            }
        });
    }, [section, playerState.currentSectionIndex, playerState.currentSentenceIndex, playerState.currentTime, sectionIndex]);

    return (
        <div className="w-full space-y-3 px-6 pb-4">
            {/* Section Info */}
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span className="text-red-400 font-medium">
                    {String(sectionIndex + 1).padStart(2, '0')}. {section.title}
                </span>
                {/* <span className="text-xs">
                    {Math.round(overallProgress)}% 전체 진행률
                </span> */}
            </div>

            {/* Overall Progress Bar */}
            {/* <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mb-2">
                <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </div> */}

            {/* Current Section Progress */}
            {!isContentSection(section) && (
                <div className="w-full h-0.5 bg-gray-600 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${sectionProgress}%` }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                </div>
            )}

            {/* Sentence Indicators for Content Sections */}
            {isContentSection(section) && playerState.currentSectionIndex === sectionIndex && (
                <div className="flex items-center space-x-1 mt-2">
                    {section.sentences.map((sentence, index) => {
                        const progress = sentenceProgresses[index] || 0;
                        const isActive = index === playerState.currentSentenceIndex;

                        return (
                            <div
                                key={sentence.id}
                                className={`h-0.5 flex-1 rounded-full overflow-hidden ${isActive ? 'bg-red-200/30' : 'bg-gray-600/50'
                                    }`}
                                title={`문장 ${index + 1}: ${progress.toFixed(1)}%`}
                            >
                                <motion.div
                                    className="h-full bg-red-400 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Time Info */}
            {/* <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>
                    {Math.floor(playerState.currentTime / 1000 / 60)}:
                    {String(Math.floor((playerState.currentTime / 1000) % 60)).padStart(2, '0')}
                </span>
                <span>
                    {Math.floor((section.startTime + section.duration) / 1000 / 60)}:
                    {String(Math.floor(((section.startTime + section.duration) / 1000) % 60)).padStart(2, '0')}
                </span>
            </div> */}
        </div>
    );
};