import { useEffect, useRef, RefObject } from 'react';

interface UseVerticalToHorizontalScrollProps {
    containerRef: RefObject<HTMLDivElement | null>;
    enabled?: boolean;
}

export const useVerticalToHorizontalScroll = ({
    containerRef,
    enabled = true
}: UseVerticalToHorizontalScrollProps) => {
    const scrollDirectionRef = useRef<'horizontal' | 'vertical' | null>(null);
    const lastScrollTimeRef = useRef(0);

    useEffect(() => {
        if (!enabled || !containerRef.current) return;

        const container = containerRef.current;
        const DIRECTION_TIMEOUT = 100;

        const handleWheel = (e: WheelEvent) => {
            const now = Date.now();
            
            if (container.scrollWidth <= container.clientWidth) {
                return;
            }

            if (now - lastScrollTimeRef.current > DIRECTION_TIMEOUT) {
                scrollDirectionRef.current = null;
            }
            lastScrollTimeRef.current = now;

            // 스크롤 방향 결정
            const absDeltaX = Math.abs(e.deltaX);
            const absDeltaY = Math.abs(e.deltaY);
            
            // 아직 방향이 결정되지 않았다면 결정
            if (scrollDirectionRef.current === null) {
                if (absDeltaY > absDeltaX) {
                    scrollDirectionRef.current = 'vertical';
                } else if (absDeltaX > absDeltaY) {
                    scrollDirectionRef.current = 'horizontal';
                }
            }

            // 세로 스크롤로 결정되었고 세로 delta가 있는 경우
            if (scrollDirectionRef.current === 'vertical' && e.deltaY !== 0) {
                e.preventDefault();
                
                // 세로 스크롤을 가로 스크롤로 변환
                const scrollAmount = e.deltaY;
                container.scrollLeft += scrollAmount;
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const scrollAmount = 400;
                const targetScrollLeft = e.key === 'ArrowLeft' 
                    ? container.scrollLeft - scrollAmount 
                    : container.scrollLeft + scrollAmount;

                container.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth'
                });
            }
        };

        container.addEventListener('wheel', handleWheel);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('wheel', handleWheel);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [containerRef, enabled]);
};