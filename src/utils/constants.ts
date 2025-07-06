export const CARD_CONSTANTS = {
  // 카드 크기
  WIDTH: 360, // 카드의 실제 너비
  BASE_HEIGHT: 480, // 기본 카드 높이
  MAX_SCALE: 1.2, // 최대 스케일 비율
  
  // 카드 간격 및 마진
  MARGIN: 16,
  TOTAL_WIDTH: 400,
  
  CONTAINER_HEIGHT: 480 * 1.2, // BASE_HEIGHT * MAX_SCALE
  
  // 패딩 및 오프셋
  PADDING_OFFSET: 0.5, // 50vw
} as const;

export const SCROLL_CONSTANTS = {
  // 애니메이션
  DURATION: 500,
  BEHAVIOR: 'smooth' as ScrollBehavior,
  
  // 스크롤 감지
  THROTTLE_DELAY: 16,
} as const; 