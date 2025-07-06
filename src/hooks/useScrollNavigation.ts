import { useState, useEffect, useRef, RefObject } from 'react';
import { CARD_CONSTANTS, SCROLL_CONSTANTS } from '@/utils/constants';

interface Props {
  containerRef: RefObject<HTMLDivElement | null>;
  itemWidth: number;
  itemsLength: number;
  disableAutoScroll?: boolean;
}

export const useScrollNavigation = ({
  containerRef,
  itemWidth,
  itemsLength,
  disableAutoScroll = false
}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [centerIndex, setCenterIndex] = useState(0);
  const [scrollPositions, setScrollPositions] = useState<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const scrollAnimationFrameRef = useRef<number | null>(null);

  // 각 카드의 중심 거리 계산
  const calculateCenterDistance = (index: number, scrollLeft: number, containerWidth: number) => {
    if (!containerRef.current) return Infinity;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportCenter = containerRect.left + (containerRect.width / 2);

    // 컨테이너 내의 모든 카드 요소들을 찾기
    const cardElements = container.querySelectorAll('[data-card-index]');
    const targetCard = Array.from(cardElements).find(el =>
      parseInt(el.getAttribute('data-card-index') || '0') === index
    );

    if (targetCard) {
      const cardRect = targetCard.getBoundingClientRect();
      const cardCenter = cardRect.left + (cardRect.width / 2);
      return Math.abs(cardCenter - viewportCenter);
    }

    // DOM 요소를 찾을 수 없는 경우
    const paddingOffset = window.innerWidth * CARD_CONSTANTS.PADDING_OFFSET;
    const marginOffset = itemWidth / 2;
    const cardMargin = CARD_CONSTANTS.MARGIN;
    const cardActualWidth = CARD_CONSTANTS.WIDTH;

    const cardStartPosition = index * itemWidth + paddingOffset - marginOffset + cardMargin;
    const cardCenter = cardStartPosition + (cardActualWidth / 2);
    const fallbackViewportCenter = scrollLeft + (containerWidth / 2);

    return Math.abs(cardCenter - fallbackViewportCenter);
  };

  // 스케일 계산 (중심에 가까울수록 1.2배, 멀어질수록 1.0배)
  const calculateScale = (distance: number, maxDistance: number) => {
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    return 1 + ((CARD_CONSTANTS.MAX_SCALE - 1) * (1 - normalizedDistance));
  };

  const handleScroll = () => {
    if (scrollAnimationFrameRef.current) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
    }

    scrollAnimationFrameRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;

      // 현재 중심에 가장 가까운 카드 찾기
      let closestIndex = 0;
      let minDistance = Infinity;
      const distances: number[] = [];

      for (let i = 0; i < itemsLength; i++) {
        const distance = calculateCenterDistance(i, scrollLeft, containerWidth);
        distances.push(distance);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      setCenterIndex(closestIndex);
      setScrollPositions(distances);

      // 현재 인덱스 업데이트
      const newIndex = Math.round(scrollLeft / itemWidth);
      if (newIndex !== currentIndex) {
        setCurrentIndex(Math.max(0, Math.min(newIndex, itemsLength - 1)));
      }
    });
  };

  // 부드러운 스크롤 애니메이션
  const smoothScrollToIndex = (index: number) => {
    if (disableAutoScroll) return;

    if (!containerRef.current) return;

    const container = containerRef.current;
    const targetScrollLeft = index * itemWidth;
    const startScrollLeft = container.scrollLeft;
    const distance = targetScrollLeft - startScrollLeft;
    const duration = SCROLL_CONSTANTS.DURATION;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeInOutCubic 이징 함수
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const currentScrollLeft = startScrollLeft + distance * easeInOutCubic(progress);
      container.scrollLeft = currentScrollLeft;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (scrollAnimationFrameRef.current) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
    };
  }, [containerRef, itemWidth, itemsLength]);

  return {
    currentIndex,
    centerIndex,
    scrollPositions,
    smoothScrollToIndex: disableAutoScroll ? () => { } : smoothScrollToIndex,
    calculateScale: (index: number) => {
      const distance = scrollPositions[index] || 0;
      const maxDistance = itemWidth; // 최대 거리를 카드 너비로 설정
      return calculateScale(distance, maxDistance);
    }
  };
};