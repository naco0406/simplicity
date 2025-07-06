import { useScrollNavigation } from '@/hooks/useScrollNavigation';
import { useVerticalToHorizontalScroll } from '@/hooks/useVerticalToHorizontalScroll';
import { Conference } from '@/types/conference';
import { CARD_CONSTANTS, SCROLL_CONSTANTS } from '@/utils/constants';
import { FC, memo, useRef, useEffect } from 'react';
import { ConferenceCard } from './ConferenceCard';

interface Props {
    conferences: Conference[];
}

export const ConferenceGrid: FC<Props> = memo(({ conferences }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const CARD_WIDTH = CARD_CONSTANTS.TOTAL_WIDTH;
    const BASE_HEIGHT = CARD_CONSTANTS.BASE_HEIGHT;

    const {
        centerIndex,
        calculateScale,
    } = useScrollNavigation({
        containerRef: scrollContainerRef,
        itemWidth: CARD_WIDTH,
        itemsLength: conferences.length,
        disableAutoScroll: false,
    });

    // 상하 스크롤을 좌우 스크롤로 변환
    useVerticalToHorizontalScroll({
        containerRef: scrollContainerRef,
        enabled: true
    });

    // 카드 클릭 시 해당 카드를 중앙으로 스크롤
    const handleCardClick = (index: number) => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;

        // 카드의 실제 위치 계산
        const paddingOffset = window.innerWidth * CARD_CONSTANTS.PADDING_OFFSET;
        const marginOffset = CARD_WIDTH / 2;
        const cardMargin = CARD_CONSTANTS.MARGIN;
        const cardActualWidth = CARD_CONSTANTS.WIDTH;
        const cardStartPosition = index * CARD_WIDTH + paddingOffset - marginOffset + cardMargin;
        const cardCenter = cardStartPosition + (cardActualWidth / 2);

        // 화면 중앙에 카드를 위치시키기 위한 스크롤 위치
        const targetScrollLeft = cardCenter - (window.innerWidth / 2);

        container.scrollTo({
            left: targetScrollLeft,
            behavior: SCROLL_CONSTANTS.BEHAVIOR
        });
    };

    // 즉시 스크롤 함수 (애니메이션 없이)
    const scrollToCardInstantly = (index: number) => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;

        // 카드의 실제 위치 계산
        const paddingOffset = window.innerWidth * CARD_CONSTANTS.PADDING_OFFSET;
        const marginOffset = CARD_WIDTH / 2;
        const cardMargin = CARD_CONSTANTS.MARGIN;
        const cardActualWidth = CARD_CONSTANTS.WIDTH;
        const cardStartPosition = index * CARD_WIDTH + paddingOffset - marginOffset + cardMargin;
        const cardCenter = cardStartPosition + (cardActualWidth / 2);

        // 화면 중앙에 카드를 위치시키기 위한 스크롤 위치
        const targetScrollLeft = cardCenter - (window.innerWidth / 2);

        // 즉시 스크롤 (애니메이션 없이)
        container.scrollLeft = targetScrollLeft;
    };

    // 커스텀 이벤트 리스너들
    useEffect(() => {
        const handleScrollToCard = (event: CustomEvent) => {
            const { index } = event.detail;
            handleCardClick(index);
        };

        const handleScrollToCardInstantly = (event: CustomEvent) => {
            const { index } = event.detail;
            scrollToCardInstantly(index);
        };

        window.addEventListener('scrollToCard', handleScrollToCard as EventListener);
        window.addEventListener('scrollToCardInstantly', handleScrollToCardInstantly as EventListener);

        return () => {
            window.removeEventListener('scrollToCard', handleScrollToCard as EventListener);
            window.removeEventListener('scrollToCardInstantly', handleScrollToCardInstantly as EventListener);
        };
    }, []);

    return (
        <div className="relative h-full w-full flex items-center">
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto items-center w-full h-full"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingLeft: `calc(50vw - ${CARD_WIDTH / 2}px)`,
                    paddingRight: `calc(50vw - ${CARD_WIDTH / 2}px)`,
                }}
            >
                {conferences.map((conference, index) => {
                    const scale = calculateScale(index);
                    const isCenterCard = index === centerIndex;
                    const dynamicHeight = BASE_HEIGHT * scale;

                    return (
                        <div
                            key={conference.id}
                            className="transition-all duration-300 ease-out flex-shrink-0"
                        >
                            <ConferenceCard
                                conference={conference}
                                index={index}
                                isVisible={true}
                                isFocused={isCenterCard}
                                dynamicHeight={dynamicHeight}
                                onCardClick={handleCardClick}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
});