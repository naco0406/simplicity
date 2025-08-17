'use client';

import { useEffect, useState } from 'react';

// 모바일 디바이스 감지
export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // 초기 확인
    checkDevice();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [breakpoint]);

  return isMobile;
};

// 터치 디바이스 감지
export const useIsTouchDevice = (): boolean => {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
      );
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
};

// 화면 크기별 값 반환
export const getResponsiveValue = <T>(
  mobile: T,
  tablet: T,
  desktop: T,
  currentWidth: number = typeof window !== 'undefined' ? window.innerWidth : 768
): T => {
  if (currentWidth < 640) return mobile;
  if (currentWidth < 1024) return tablet;
  return desktop;
};

// 뷰포트 크기 hook
export const useViewportSize = () => {
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const updateSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return viewportSize;
};

// 모바일용 카드 상수
export const getMobileCardConstants = (viewportWidth: number) => {
  if (viewportWidth < 480) {
    // 작은 모바일 (iPhone SE, 등)
    return {
      WIDTH: Math.min(280, viewportWidth - 80),
      BASE_HEIGHT: 360,
      MARGIN: 12,
      TOTAL_WIDTH: Math.min(320, viewportWidth - 40),
      MAX_SCALE: 1.1,
    };
  } else if (viewportWidth < 768) {
    // 일반 모바일
    return {
      WIDTH: Math.min(320, viewportWidth - 80),
      BASE_HEIGHT: 400,
      MARGIN: 14,
      TOTAL_WIDTH: Math.min(360, viewportWidth - 40),
      MAX_SCALE: 1.15,
    };
  } else {
    // 태블릿 이상
    return {
      WIDTH: 360,
      BASE_HEIGHT: 480,
      MARGIN: 16,
      TOTAL_WIDTH: 400,
      MAX_SCALE: 1.2,
    };
  }
};

// 안전한 영역을 고려한 패딩 계산 (notch 등)
export const getSafeAreaPadding = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
  };
}; 