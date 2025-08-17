'use client';

import { PlayerState } from '@/types/conference-player';
import { ContentSection as ContentSectionType } from '@/types/conference-section';
import { generateComplexGradient } from '@/utils/color-utils';
import { DEFAULT_COLOR } from '@/utils/constants';
import { useIsMobile } from '@/utils/mobile-utils';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface PlayerActions {
    seekToSentence: (sentenceIndex: number) => void;
}

interface Props {
    section: ContentSectionType;
    playerState: PlayerState;
    actions: PlayerActions;
    conferenceColor?: string;
}

export const ContentSection: FC<Props> = ({
    section,
    playerState,
    // actions,
    conferenceColor = DEFAULT_COLOR
}) => {
    const textRef = useRef<HTMLDivElement>(null);
    const [textLines, setTextLines] = useState<string[]>([]);
    const isMobile = useIsMobile();
    const currentSentence = section.sentences[playerState.currentSentenceIndex];

    const measureTextLinesWithRange = useCallback(() => {
        if (!textRef.current || !currentSentence) {
            setTextLines([]);
            return;
        }

        const element = textRef.current;
        const text = currentSentence.text;

        if (!text.trim()) {
            setTextLines([]);
            return;
        }

        try {
            // 요소가 실제로 렌더링되어 있는지 확인
            const elementRect = element.getBoundingClientRect();
            if (elementRect.width === 0 || elementRect.height === 0) {
                setTextLines([text]);
                return;
            }

            // 임시로 실제 텍스트 설정
            const originalContent = element.textContent;
            // const originalInnerHTML = element.innerHTML;
            element.textContent = text;

            // DOM 업데이트가 완료될 때까지 짧은 지연
            setTimeout(() => {
                try {
                    const textNode = element.firstChild as Text;

                    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
                        element.textContent = originalContent;
                        setTextLines([text]);
                        return;
                    }

                    const range = document.createRange();
                    const lines: string[] = [];
                    const words = text.split(' ').filter(word => word.trim().length > 0);

                    if (words.length === 0) {
                        element.textContent = originalContent;
                        setTextLines([text]);
                        return;
                    }

                    if (words.length === 1) {
                        element.textContent = originalContent;
                        setTextLines([text]);
                        return;
                    }

                    let currentLineWords: string[] = [];
                    let lastBottom = -1;
                    let textPosition = 0;

                    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
                        const word = words[wordIndex];

                        // 현재 단어의 끝 위치 계산
                        // const wordStartPos = textPosition;
                        const wordEndPos = textPosition + word.length;

                        // 범위가 유효한지 확인
                        if (wordEndPos <= textNode.textContent!.length) {
                            range.setStart(textNode, Math.min(wordEndPos, textNode.textContent!.length));
                            range.setEnd(textNode, Math.min(wordEndPos, textNode.textContent!.length));

                            const rect = range.getBoundingClientRect();

                            // 첫 번째 단어이거나 같은 줄인 경우
                            if (lastBottom === -1 || Math.abs(rect.bottom - lastBottom) <= 2) {
                                currentLineWords.push(word);
                                lastBottom = rect.bottom;
                            } else {
                                // 새로운 줄이 시작됨
                                if (currentLineWords.length > 0) {
                                    const lineText = currentLineWords.join(' ');
                                    lines.push(lineText);
                                }
                                currentLineWords = [word];
                                lastBottom = rect.bottom;
                            }
                        } else {
                            currentLineWords.push(word);
                        }

                        // 다음 단어를 위한 위치 업데이트 (공백 포함)
                        textPosition = wordEndPos;
                        if (wordIndex < words.length - 1) {
                            textPosition += 1; // 공백
                        }
                    }

                    // 마지막 줄 추가
                    if (currentLineWords.length > 0) {
                        const lastLineText = currentLineWords.join(' ');
                        lines.push(lastLineText);
                    }

                    // 원래 내용 복원
                    element.textContent = originalContent;

                    if (lines.length === 0) {
                        setTextLines([text]);
                    } else {
                        setTextLines(lines);
                    }

                } catch (innerError) {
                    console.error(innerError);
                    element.textContent = originalContent;
                    setTextLines([text]);
                }
            }, 10);

        } catch (error) {
            console.error(error);
            setTextLines([text]);
        }
    }, [currentSentence?.text]);

    // fallback 방법: 개선된 기존 방식
    const measureTextLinesFallback = useCallback(() => {
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

            // 실제 렌더링된 요소와 동일한 스타일 복사
            const measureElement = document.createElement('div');
            const computedStyle = getComputedStyle(element);

            // 모든 관련 스타일 속성들을 정확히 복사
            const styleProperties = [
                'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
                'letterSpacing', 'wordSpacing', 'textTransform',
                'fontVariant', 'fontStretch', 'lineHeight',
                'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth',
                'marginLeft', 'marginRight', 'boxSizing'
            ];

            styleProperties.forEach(prop => {
                measureElement.style[prop as any] = computedStyle[prop as any];
            });

            // 측정용 요소 설정
            measureElement.style.position = 'absolute';
            measureElement.style.visibility = 'hidden';
            measureElement.style.whiteSpace = 'nowrap';
            measureElement.style.top = '-9999px';
            measureElement.style.left = '-9999px';
            measureElement.style.width = 'auto';
            measureElement.style.height = 'auto';
            measureElement.style.maxWidth = 'none';
            measureElement.style.overflow = 'visible';

            // 실제 컨테이너와 동일한 박스 모델 적용
            const availableWidth = containerWidth -
                parseFloat(computedStyle.paddingLeft) -
                parseFloat(computedStyle.paddingRight) -
                parseFloat(computedStyle.borderLeftWidth) -
                parseFloat(computedStyle.borderRightWidth);

            document.body.appendChild(measureElement);

            const lines: string[] = [];
            let currentLine: string[] = [];

            words.forEach((word) => {
                const testWords = currentLine.length === 0 ? [word] : [...currentLine, word];
                const testLine = testWords.join(' ');

                measureElement.textContent = testLine;
                const textWidth = measureElement.getBoundingClientRect().width;

                if (textWidth <= availableWidth || currentLine.length === 0) {
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
            console.error(error);
            setTextLines([text]);
        }
    }, [currentSentence?.text]);

    // 메인 측정 함수: Range API를 우선 시도하고, 실패시 fallback 사용
    const measureTextLines = useCallback(() => {
        if (!textRef.current || !currentSentence) {
            setTextLines([]);
            return;
        }

        const text = currentSentence.text;

        // 빈 텍스트 체크
        if (!text.trim()) {
            setTextLines([]);
            return;
        }

        // Range API 지원 여부 확인
        if (typeof document.createRange === 'function') {
            try {
                measureTextLinesWithRange();
                return;
            } catch (error) {
                console.error(error);
            }
        }

        // fallback 방법 사용
        measureTextLinesFallback();
    }, [currentSentence?.text, measureTextLinesWithRange, measureTextLinesFallback]);

    useEffect(() => {
        if (currentSentence) {
            setTextLines([]);

            // 요소가 렌더링될 때까지 기다리는 더 안전한 방법
            const checkAndMeasure = () => {
                if (textRef.current) {
                    const rect = textRef.current.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        measureTextLines();
                    } else {
                        setTimeout(checkAndMeasure, 25);
                    }
                } else {
                    setTimeout(checkAndMeasure, 25);
                }
            };

            const timer = setTimeout(checkAndMeasure, 50);
            return () => clearTimeout(timer);
        } else {
            setTextLines([]);
        }
    }, [currentSentence?.id, currentSentence?.text, measureTextLines]);

    useEffect(() => {
        const handleResize = () => {
            if (currentSentence) {
                setTextLines([]);
                setTimeout(() => {
                    measureTextLines();
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [currentSentence?.id, measureTextLines]);

    if (!currentSentence) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className={`text-gray-400 ${isMobile ? 'text-base' : 'text-lg'}`}>
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

    // 문장 전환 애니메이션을 위한 투명도 계산
    const getTransitionOpacity = (): number => {
        const sectionTime = playerState.currentTime - section.startTime;
        const currentSentenceIndex = playerState.currentSentenceIndex;

        // 현재 문장
        const currentSentence = section.sentences[currentSentenceIndex];

        if (!currentSentence) return 1;

        const sentenceStartTime = currentSentence.startTime;
        const sentenceEndTime = currentSentence.endTime;

        const fadeInStartTime = sentenceStartTime + 200;
        const fadeInEndTime = sentenceStartTime + 200;

        const fadeOutStartTime = sentenceEndTime - 200;
        const fadeOutEndTime = sentenceEndTime - 200;

        // 새 문장 시작 직후 투명 구간 (0~10ms)
        if (sectionTime >= sentenceStartTime && sectionTime <= fadeInStartTime) {
            return 0;
        }

        // 새 문장 fade-in 구간 (10ms~200ms)
        if (sectionTime > fadeInStartTime && sectionTime <= fadeInEndTime) {
            const fadeProgress = (sectionTime - fadeInStartTime) / (fadeInEndTime - fadeInStartTime);
            return fadeProgress;
        }

        // 현재 문장 종료 전 fade-out 구간
        if (sectionTime >= fadeOutStartTime && sectionTime < fadeOutEndTime) {
            const fadeProgress = (sectionTime - fadeOutStartTime) / (fadeOutEndTime - fadeOutStartTime);
            const opacity = 1 - fadeProgress;
            return opacity;
        }

        // 현재 문장 종료 직전 투명 구간 (끝나기 10ms 전부터 끝까지)
        if (sectionTime >= fadeOutEndTime && sectionTime < sentenceEndTime) {
            return 0;
        }

        // 일반적인 상태 (완전히 보이는 상태)
        return 1;
    };

    const sentenceProgress = getSentenceProgress();
    const transitionOpacity = getTransitionOpacity();

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

        if (lineProgress <= 0) {
            return {
                color: '#9ca3af'
            };
        } else {
            return generateComplexGradient(conferenceColor, lineProgress);
        }
    };

    const getTextStyle = () => {
        return generateComplexGradient(conferenceColor, sentenceProgress);
    };

    return (
        <div className={`flex-1 flex flex-col justify-center items-center ${
            isMobile ? 'px-4 py-6' : 'px-8 py-12'
        }`}>
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-left relative">
                    {/* 깜빡거림 방지를 위한 절대 위치 컨테이너 */}
                    <div
                        className={`relative ${
                            isMobile 
                                ? 'min-h-[6rem] sm:min-h-[8rem]' 
                                : 'min-h-[8rem] md:min-h-[12rem] lg:min-h-[16rem]'
                        }`}
                        style={{
                            opacity: transitionOpacity,
                            transition: 'opacity 0.1s ease-out'
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSentence.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 flex items-center"
                            >
                                <div className={`font-medium leading-relaxed w-full ${
                                    isMobile 
                                        ? 'text-xl sm:text-2xl' 
                                        : 'text-2xl md:text-3xl lg:text-4xl'
                                }`}>
                                    {textLines.length > 1 ? (
                                        <div ref={textRef}>
                                            {textLines.map((line, index) => (
                                                <div
                                                    key={`${currentSentence.id}-line-${index}`}
                                                    style={getLineStyle(index)}
                                                    className="block transition-colors duration-100 ease-out"
                                                >
                                                    {line}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            ref={textRef}
                                            style={getTextStyle()}
                                            className="transition-colors duration-100 ease-out"
                                        >
                                            {currentSentence.text}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};