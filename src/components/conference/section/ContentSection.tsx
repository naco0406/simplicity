'use client';

import { PlayerState } from '@/types/conference-player';
import { ContentSection as ContentSectionType } from '@/types/conference-section';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface PlayerActions {
    seekToSentence: (sentenceIndex: number) => void;
}

interface Props {
    section: ContentSectionType;
    playerState: PlayerState;
    actions: PlayerActions;
}

export const ContentSection: FC<Props> = ({
    section,
    playerState,
}) => {
    const textRef = useRef<HTMLDivElement>(null);
    const [textLines, setTextLines] = useState<string[]>([]);
    const currentSentence = section.sentences[playerState.currentSentenceIndex];

    const measureTextLines = useCallback(() => {
        if (!textRef.current || !currentSentence) {
            setTextLines([]);
            return;
        }

        const element = textRef.current;
        const text = currentSentence.text;
        const words = text.split(' ');

        if (!text.trim() || words.length === 0) {
            setTextLines([]);
            return;
        }

        try {
            const containerWidth = element.offsetWidth;

            if (containerWidth === 0) {
                setTextLines([text]);
                return;
            }

            // Create measurement element with exact same styling
            const measureElement = document.createElement('div');
            const computedStyle = getComputedStyle(element);

            measureElement.style.position = 'absolute';
            measureElement.style.visibility = 'hidden';
            measureElement.style.whiteSpace = 'nowrap';
            measureElement.style.fontSize = computedStyle.fontSize;
            measureElement.style.fontFamily = computedStyle.fontFamily;
            measureElement.style.fontWeight = computedStyle.fontWeight;
            measureElement.style.letterSpacing = computedStyle.letterSpacing;
            measureElement.style.lineHeight = computedStyle.lineHeight;
            measureElement.style.top = '-9999px';
            measureElement.style.left = '-9999px';
            document.body.appendChild(measureElement);

            const lines: string[] = [];
            let currentLine: string[] = [];

            words.forEach((word, index) => {
                const testLine = currentLine.length === 0 ? word : currentLine.join(' ') + ' ' + word;
                measureElement.textContent = testLine;

                if (measureElement.offsetWidth <= containerWidth || currentLine.length === 0) {
                    currentLine.push(word);
                } else {
                    if (currentLine.length > 0) {
                        lines.push(currentLine.join(' '));
                    }
                    currentLine = [word];
                }
            });

            if (currentLine.length > 0) {
                lines.push(currentLine.join(' '));
            }

            document.body.removeChild(measureElement);

            setTextLines(lines.length > 0 ? lines : [text]);

        } catch (error) {
            console.error('Error measuring text lines:', error);
            setTextLines([text]);
        }
    }, [currentSentence?.text]);

    useEffect(() => {
        if (currentSentence) {
            setTextLines([]);
            const timer = setTimeout(() => {
                measureTextLines();
            }, 50);

            return () => clearTimeout(timer);
        } else {
            setTextLines([]);
        }
    }, [currentSentence?.id, currentSentence?.text, measureTextLines]);

    useEffect(() => {
        const handleResize = () => {
            if (currentSentence) {
                setTextLines([]);
                const timer = setTimeout(() => {
                    measureTextLines();
                }, 100);

                return () => clearTimeout(timer);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentSentence?.id, measureTextLines]);

    if (!currentSentence) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 text-lg">
                    섹션을 로딩 중... (문장 인덱스: {playerState.currentSentenceIndex}, 총 문장: {section.sentences.length})
                </p>
            </div>
        );
    }

    const getSentenceProgress = (): number => {
        const sectionTime = playerState.currentTime - section.startTime;
        const sentenceStartTime = currentSentence.startTime;
        const sentenceEndTime = currentSentence.endTime;

        if (sectionTime < sentenceStartTime) return 0;
        if (sectionTime >= sentenceEndTime) return 100;

        const progress = ((sectionTime - sentenceStartTime) / (sentenceEndTime - sentenceStartTime)) * 100;
        return Math.min(100, Math.max(0, progress));
    };

    const sentenceProgress = getSentenceProgress();

    const getLineProgress = (lineIndex: number): number => {
        const totalLines = textLines.length;
        if (totalLines === 0 || totalLines === 1) return sentenceProgress;

        const lineStartProgress = (lineIndex / totalLines) * 100;
        const lineEndProgress = ((lineIndex + 1) / totalLines) * 100;

        if (sentenceProgress < lineStartProgress) return 0;
        if (sentenceProgress >= lineEndProgress) return 100;

        const progressInLine = ((sentenceProgress - lineStartProgress) / (lineEndProgress - lineStartProgress)) * 100;
        return Math.min(100, Math.max(0, progressInLine));
    };

    const getLineStyle = (lineIndex: number) => {
        const lineProgress = getLineProgress(lineIndex);

        if (lineProgress >= 100) {
            return {
                color: '#ef4444'
            };
        } else if (lineProgress <= 0) {
            return {
                color: '#9ca3af'
            };
        } else {
            const activeProgress = Math.max(0, lineProgress);
            const fadeWidth = 15;

            return {
                backgroundImage: `linear-gradient(to right, 
          #ef4444 0%, 
          #ef4444 ${Math.max(0, activeProgress - fadeWidth)}%, 
          #f56565 ${Math.max(0, activeProgress - fadeWidth * 0.8)}%, 
          #f87171 ${Math.max(0, activeProgress - fadeWidth * 0.6)}%, 
          #fca5a5 ${Math.max(0, activeProgress - fadeWidth * 0.4)}%, 
          #fecaca ${Math.max(0, activeProgress - fadeWidth * 0.2)}%, 
          #fee2e2 ${activeProgress}%, 
          #f3f4f6 ${Math.min(100, activeProgress + 2)}%, 
          #e5e7eb ${Math.min(100, activeProgress + 4)}%, 
          #d1d5db ${Math.min(100, activeProgress + 8)}%, 
          #9ca3af ${Math.min(100, activeProgress + 12)}%, 
          #9ca3af 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat'
            };
        }
    };

    const getTextStyle = () => {
        if (sentenceProgress >= 100) {
            return {
                color: '#ef4444'
            };
        } else if (sentenceProgress <= 0) {
            return {
                color: '#9ca3af'
            };
        } else {
            const activeProgress = Math.max(0, sentenceProgress);
            const fadeWidth = 15;

            return {
                backgroundImage: `linear-gradient(to right, 
          #ef4444 0%, 
          #ef4444 ${Math.max(0, activeProgress - fadeWidth)}%, 
          #f56565 ${Math.max(0, activeProgress - fadeWidth * 0.8)}%, 
          #f87171 ${Math.max(0, activeProgress - fadeWidth * 0.6)}%, 
          #fca5a5 ${Math.max(0, activeProgress - fadeWidth * 0.4)}%, 
          #fecaca ${Math.max(0, activeProgress - fadeWidth * 0.2)}%, 
          #fee2e2 ${activeProgress}%, 
          #f3f4f6 ${Math.min(100, activeProgress + 2)}%, 
          #e5e7eb ${Math.min(100, activeProgress + 4)}%, 
          #d1d5db ${Math.min(100, activeProgress + 8)}%, 
          #9ca3af ${Math.min(100, activeProgress + 12)}%, 
          #9ca3af 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat'
            };
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-left">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSentence.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed"
                        >
                            {textLines.length > 1 ? (
                                textLines.map((line, index) => (
                                    <div
                                        key={`${currentSentence.id}-line-${index}`}
                                        style={getLineStyle(index)}
                                        className="block"
                                    >
                                        {line}
                                    </div>
                                ))
                            ) : (
                                <div
                                    ref={textRef}
                                    style={getTextStyle()}
                                >
                                    {currentSentence.text}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};