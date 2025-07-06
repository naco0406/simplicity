'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { Conference } from '@/types/conference';

interface CardTransitionData {
    conference: Conference;
    index: number;
    cardElement: HTMLElement;
}

interface PageTransitionContextType {
    isTransitioning: boolean;
    transitionData: CardTransitionData | null;
    startTransition: (data: CardTransitionData) => Promise<void>;
    startReturnTransition: (conference: Conference) => Promise<void>;
    executeReturnAnimation: (conference: Conference, targetCardElement?: HTMLElement | null) => Promise<void>;
    endTransition: () => void;
    isReturning: boolean;
    setIsReturning: (returning: boolean) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export const PageTransitionProvider = ({ children }: { children: ReactNode }) => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionData, setTransitionData] = useState<CardTransitionData | null>(null);
    const [isReturning, setIsReturning] = useState(false);
    const overlayRef = useRef<HTMLDivElement | null>(null);

    const startTransition = useCallback(async (data: CardTransitionData) => {
        setTransitionData(data);
        setIsTransitioning(true);
        setIsReturning(false);

        const originalCard = data.cardElement;

        // 1단계: 배경 오버레이 생성
        const overlay = document.createElement('div');
        overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: black;
      opacity: 0;
      transition: opacity 0.6s ease-out;
      z-index: 9998;
      pointer-events: none;
    `;
        document.body.appendChild(overlay);
        overlayRef.current = overlay;

        // 2단계: 원본 카드 스타일 설정
        originalCard.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        originalCard.style.transformOrigin = 'center center';
        originalCard.style.zIndex = '9999';
        originalCard.style.position = 'relative';
        originalCard.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
        originalCard.style.backdropFilter = 'blur(4px)';
        originalCard.style.borderRadius = '1rem';

        await new Promise(resolve => setTimeout(resolve, 200));

        // 3단계: 배경 어두워지기 + 카드 어두워지기
        overlay.style.opacity = '0.7';
        originalCard.style.filter = 'brightness(1)';

        await new Promise(resolve => setTimeout(resolve, 200));

        // 4단계: 카드 확대 + 위치 이동
        const cardRect = originalCard.getBoundingClientRect();
        const targetScaleX = window.innerWidth / cardRect.width;
        const targetScaleY = window.innerHeight / cardRect.height;
        const targetScale = Math.max(targetScaleX, targetScaleY) * 1.1;

        originalCard.style.transform = `scale(${targetScale})`;
        originalCard.style.borderRadius = '0';

        await new Promise(resolve => setTimeout(resolve, 200));

        // 5단계: 배경 더 어두워지면서 카드도 어두워지기
        overlay.style.opacity = '1';
        originalCard.style.filter = 'brightness(0.4)';

        await new Promise(resolve => setTimeout(resolve, 200));

        // 6단계: 카드 완전히 투명하게
        originalCard.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, 200));

        return Promise.resolve();
    }, []);

    const startReturnTransition = useCallback(async (conference: Conference) => {
        setIsReturning(true);
        setIsTransitioning(true);

        // 검은 화면 오버레이 생성
        const overlay = document.createElement('div');
        overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: black;
      opacity: 1;
      transition: opacity 0.4s ease-out;
      z-index: 10000;
      pointer-events: none;
    `;
        document.body.appendChild(overlay);
        overlayRef.current = overlay;

        // 홈페이지 진입 시 애니메이션을 위한 데이터를 sessionStorage에 저장
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('returnTransitionData', JSON.stringify({ conference }));
        }

        return Promise.resolve();
    }, []);

    // 홈페이지에서 호출될 복귀 애니메이션 실행 함수
    const executeReturnAnimation = useCallback(async (conference: Conference, targetCardElement?: HTMLElement | null) => {
        // 검은 화면 오버레이 생성
        let overlay = overlayRef.current;
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: black;
        opacity: 1;
        transition: opacity 0.6s ease-out;
        z-index: 9998;
        pointer-events: none;
      `;
            document.body.appendChild(overlay);
            overlayRef.current = overlay;
        } else {
            // 기존 오버레이가 있다면 즉시 불투명하게 설정
            overlay.style.opacity = '1';
        }

        // 타겟 카드의 위치와 크기 계산 (포커스된 카드 기준)
        let targetRect = {
            left: window.innerWidth / 2 - 180, // 360px / 2
            top: window.innerHeight / 2 - 288, // 576px / 2 (MAX_SCALE 적용된 높이)
            width: 360,
            height: 576 // BASE_HEIGHT * MAX_SCALE (480 * 1.2)
        };

        // 실제 타겟 카드 요소가 있다면 그 위치 사용
        if (targetCardElement) {
            const rect = targetCardElement.getBoundingClientRect();
            targetRect = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            };
        }

        // 전체 화면에서 시작하는 카드 생성
        const returnCard = document.createElement('div');
        const initialScale = Math.max(window.innerWidth / 360, window.innerHeight / 480) * 1.1;

        returnCard.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 360px;
      height: 480px;
      z-index: 9999;
      border-radius: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.2);
      overflow: hidden;
      opacity: 0;
      transition: all 1.0s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center center;
      transform: translate(-50%, -50%) scale(${initialScale});
    `;

        // 카드 내용 생성
        returnCard.innerHTML = `
      <div style="position: relative; height: 12rem; overflow: hidden;">
        <img src="${conference.image}" alt="${conference.title}" 
             style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);"></div>
      </div>
      <div style="padding: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: bold; color: white; margin-bottom: 0.5rem;">
          ${conference.title}
        </h3>
        <p style="color: rgb(209, 213, 219); font-size: 0.875rem;">
          ${conference.description}
        </p>
      </div>
    `;

        document.body.appendChild(returnCard);

        // 1단계: 카드 나타내기
        returnCard.style.opacity = '1';
        returnCard.style.filter = 'brightness(0.4)';

        await new Promise(resolve => setTimeout(resolve, 200));

        // 2단계: 배경 조금 밝아지면서 카드도 밝아지기
        overlay.style.opacity = '0.7';
        returnCard.style.filter = 'brightness(1)';

        await new Promise(resolve => setTimeout(resolve, 200));

        // 3단계: 카드 크기 줄이기 + 위치 이동
        returnCard.style.width = `${targetRect.width}px`;
        returnCard.style.height = `${targetRect.height}px`;
        returnCard.style.left = `${targetRect.left + targetRect.width / 2}px`;
        returnCard.style.top = `${targetRect.top + targetRect.height / 2}px`;
        returnCard.style.transform = 'translate(-50%, -50%) scale(1)';
        returnCard.style.borderRadius = '1rem';

        await new Promise(resolve => setTimeout(resolve, 800));

        // 4단계: 완전히 밝아지면서 카드도 투명하게
        overlay.style.opacity = '0';
        returnCard.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, 600));

        // 정리
        if (returnCard.parentNode) {
            returnCard.parentNode.removeChild(returnCard);
        }

        // 애니메이션 완료
        setIsTransitioning(false);
        setIsReturning(false);
    }, []);

    const endTransition = useCallback(() => {
        setIsTransitioning(false);
        setTransitionData(null);
        setIsReturning(false);

        // 오버레이 제거
        if (overlayRef.current && document.body.contains(overlayRef.current)) {
            document.body.removeChild(overlayRef.current);
            overlayRef.current = null;
        }
    }, []);

    return (
        <PageTransitionContext.Provider
            value={{
                isTransitioning,
                transitionData,
                startTransition,
                startReturnTransition,
                executeReturnAnimation,
                endTransition,
                isReturning,
                setIsReturning,
            }}
        >
            {children}
        </PageTransitionContext.Provider>
    );
};

export const usePageTransition = () => {
    const context = useContext(PageTransitionContext);
    if (context === undefined) {
        throw new Error('usePageTransition must be used within a PageTransitionProvider');
    }
    return context;
};