'use client';

import { usePageTransition } from '@/hooks/usePageTransition';
import { Conference } from '@/types/conference';
import { CARD_CONSTANTS } from '@/utils/constants';
import { useRouter } from 'next/navigation';
import { FC, memo, useRef, useEffect } from 'react';

interface Props {
    conference: Conference;
    index: number;
    isVisible: boolean;
    isFocused?: boolean;
    dynamicHeight?: number;
    onCardClick?: (index: number) => void;
}

export const ConferenceCard: FC<Props> = memo(({
    conference,
    index,
    isVisible,
    isFocused = false,
    dynamicHeight = CARD_CONSTANTS.BASE_HEIGHT,
    onCardClick
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { startTransition } = usePageTransition();
    const cardDelay = index * 0.1;

    const handleClick = async () => {
        if (!isFocused && onCardClick) {
            onCardClick(index);
        } else if (isFocused && cardRef.current) {
            try {
                await startTransition({
                    conference,
                    index,
                    cardElement: cardRef.current,
                });
                router.push(`/${conference.id}`);
            } catch (error) {
                console.error('Animation failed:', error);
                router.push(`/${conference.id}`);
            }
        }
    };

    // 포커스된 카드 클릭 시에만 자동 진입 애니메이션 (스크롤 후 실행되지 않음)
    useEffect(() => {
        if (isFocused && cardRef.current) {
            // 이미 포커스된 카드가 클릭되어 진입 애니메이션이 예약된 경우에만 실행
            const timer = setTimeout(async () => {
                if (cardRef.current && (cardRef.current as any)._shouldEnterAfterFocus) {
                    (cardRef.current as any)._shouldEnterAfterFocus = false;

                    try {
                        await startTransition({
                            conference,
                            index,
                            cardElement: cardRef.current,
                        });
                        router.push(`/${conference.id}`);
                    } catch (error) {
                        console.error('Auto-animation failed:', error);
                        router.push(`/${conference.id}`);
                    }
                }
            }, 500); // 스크롤 애니메이션 완료 대기

            return () => clearTimeout(timer);
        }
    }, [isFocused, conference, index, startTransition, router]);

    const handleFocusedCardClick = () => {
        if (cardRef.current) {
            (cardRef.current as any)._shouldEnterAfterFocus = true;
        }
        handleClick();
    };

    const handleNonFocusedCardClick = () => {
        if (onCardClick) {
            onCardClick(index);
        }
    };

    return (
        <div
            ref={cardRef}
            className={`
                relative group mx-4 cursor-pointer
                transition-all duration-500 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                ${isFocused ? 'z-10' : 'z-0'}
            `}
            style={{
                transitionDelay: `${cardDelay}s`,
                width: `${CARD_CONSTANTS.WIDTH}px`,
                scrollSnapAlign: 'center'
            }}
            data-card-index={index}
            onClick={isFocused ? handleFocusedCardClick : handleNonFocusedCardClick}
        >
            <div
                className={`
                    relative overflow-hidden rounded-2xl
                    backdrop-blur-sm
                    transition-all duration-300 ease-out
                    ${isFocused
                        ? 'shadow-xl shadow-blue-500/20'
                        : 'shadow-xl hover:shadow-xl hover:shadow-white/10 hover:border-white/30'
                    }
                `}
                style={{
                    height: `${dynamicHeight}px`,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: isFocused ? '0 0 20px rgba(96, 165, 250, 0.3)' : undefined
                }}
            >
                {/* 포커스 상태 그라디언트 테두리 */}
                {isFocused && (
                    <div
                        className="absolute inset-0 rounded-2xl pointer-events-none z-20"
                        style={{
                            background: 'linear-gradient(135deg, #60a5fa, #a855f7)',
                            padding: '2px',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'exclude'
                        }}
                    />
                )}

                {/* 포커스 상태 글로우 효과 */}
                {isFocused && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-2xl animate-pulse" />
                )}

                {/* 이미지 섹션 */}
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    <img
                        src={conference.image}
                        alt={conference.title}
                        className="w-full h-full object-cover transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* 콘텐츠 섹션 */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {conference.title}
                    </h3>
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'rgb(209, 213, 219)' }}>
                        {conference.description}
                    </p>
                </div>
            </div>
        </div>
    );
});