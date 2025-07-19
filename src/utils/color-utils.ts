/**
 * 색상 문자열을 RGB 값으로 변환합니다.
 * @param color 색상 문자열 (hex, rgb, rgba 등)
 * @returns RGB 객체 또는 null
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // hex 색상 처리
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  // rgb/rgba 색상 처리
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return { r, g, b };
  }

  return null;
}

/**
 * RGB 값을 HSL로 변환합니다.
 * @param r Red 값 (0-255)
 * @param g Green 값 (0-255)
 * @param b Blue 값 (0-255)
 * @returns HSL 객체
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * HSL 값을 RGB로 변환합니다.
 * @param h Hue 값 (0-360)
 * @param s Saturation 값 (0-100)
 * @param l Lightness 값 (0-100)
 * @returns RGB 객체
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * RGB 값을 hex 문자열로 변환합니다.
 * @param r Red 값 (0-255)
 * @param g Green 값 (0-255)
 * @param b Blue 값 (0-255)
 * @returns hex 색상 문자열
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * 색상을 기반으로 그라디언트 테두리를 생성합니다.
 * @param baseColor 기본 색상 문자열
 * @returns 그라디언트 테두리 스타일 객체
 */
export function generateGradientBorder(baseColor: string) {
  const rgb = parseColor(baseColor);
  if (!rgb) {
    // 기본 색상이 파싱되지 않으면 기본 그라디언트 반환
    return {
      background: 'linear-gradient(135deg, #60a5fa, #a855f7)',
      boxShadow: '0 0 20px rgba(96, 165, 250, 0.3)'
    };
  }

  // HSL로 변환하여 색상 조작
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 보조 색상 생성 (색상환에서 60도 회전)
  const secondaryHsl = { ...hsl, h: (hsl.h + 60) % 360 };
  const secondaryRgb = hslToRgb(secondaryHsl.h, secondaryHsl.s, secondaryHsl.l);

  // 보조 색상을 hex로 변환
  const secondaryColor = rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);

  // 그라디언트 생성
  const gradient = `linear-gradient(135deg, ${baseColor}, ${secondaryColor})`;

  // 글로우 효과를 위한 색상 (기본 색상의 30% 투명도)
  const glowColor = `${baseColor}4D`; // 30% 투명도

  return {
    background: gradient,
    boxShadow: `0 0 20px ${glowColor}`
  };
}

/**
 * 색상을 기반으로 글로우 효과를 생성합니다.
 * @param baseColor 기본 색상 문자열
 * @returns 글로우 효과 스타일 객체
 */
export function generateGlowEffect(baseColor: string) {
  const rgb = parseColor(baseColor);
  if (!rgb) {
    return {
      background: 'linear-gradient(to-br, rgba(96, 165, 250, 0.1), rgba(168, 85, 247, 0.1))'
    };
  }

  // 기본 색상의 10% 투명도 버전
  const glowColor1 = `${baseColor}1A`; // 10% 투명도

  // 보조 색상 생성 (색상환에서 60도 회전)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const secondaryHsl = { ...hsl, h: (hsl.h + 60) % 360 };
  const secondaryRgb = hslToRgb(secondaryHsl.h, secondaryHsl.s, secondaryHsl.l);
  const secondaryColor = rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  const glowColor2 = `${secondaryColor}1A`; // 10% 투명도

  return {
    background: `linear-gradient(to-br, ${glowColor1}, ${glowColor2})`
  };
}

/**
 * 색상을 기반으로 진행률 바 색상을 생성합니다.
 * @param baseColor 기본 색상 문자열
 * @returns 진행률 바 스타일 객체
 */
export function generateProgressBarColor(baseColor: string) {
  const rgb = parseColor(baseColor);
  if (!rgb) {
    return {
      backgroundColor: '#ef4444'
    };
  }

  return {
    backgroundColor: baseColor
  };
}

/**
 * 색상을 기반으로 버튼 그라디언트를 생성합니다.
 * @param baseColor 기본 색상 문자열
 * @returns 버튼 그라디언트 스타일 객체
 */
export function generateButtonGradient(baseColor: string) {
  const rgb = parseColor(baseColor);
  if (!rgb) {
    return {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)'
    };
  }

  // 기본 색상과 어두운 버전 생성
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const darkHsl = { ...hsl, l: Math.max(20, hsl.l - 20) };
  const darkRgb = hslToRgb(darkHsl.h, darkHsl.s, darkHsl.l);
  const darkColor = rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b);

  return {
    background: `linear-gradient(135deg, ${baseColor}, ${darkColor})`
  };
}

/**
 * 색상을 기반으로 아바타 그라디언트를 생성합니다.
 * @param baseColor 기본 색상 문자열
 * @returns 아바타 그라디언트 스타일 객체
 */
export function generateAvatarGradient(baseColor: string) {
  const rgb = parseColor(baseColor);
  if (!rgb) {
    return {
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
    };
  }

  // 기본 색상과 약간 어두운 버전 생성
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const darkHsl = { ...hsl, l: Math.max(30, hsl.l - 15) };
  const darkRgb = hslToRgb(darkHsl.h, darkHsl.s, darkHsl.l);
  const darkColor = rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b);

  return {
    background: `linear-gradient(135deg, ${baseColor}, ${darkColor})`
  };
}

/**
 * 색상을 기반으로 복잡한 그라데이션을 생성합니다.
 * @param baseColor 기본 색상 문자열
 * @param progress 진행률 (0-100)
 * @returns 그라데이션 스타일 객체
 */
export function generateComplexGradient(baseColor: string, progress: number) {
  const rgb = parseColor(baseColor);
  if (!rgb) {
    // 기본값으로 파란색 계열 그라데이션 제공
    const activeProgress = Math.max(0, progress);
    const fadeWidth = 15;

    return {
      backgroundImage: `linear-gradient(to right, 
        #3b82f6 0%, 
        #3b82f6 ${Math.max(0, activeProgress - fadeWidth)}%, 
        #60a5fa ${Math.max(0, activeProgress - fadeWidth * 0.8)}%, 
        #93c5fd ${Math.max(0, activeProgress - fadeWidth * 0.6)}%, 
        #bfdbfe ${Math.max(0, activeProgress - fadeWidth * 0.4)}%, 
        #dbeafe ${Math.max(0, activeProgress - fadeWidth * 0.2)}%, 
        #eff6ff ${activeProgress}%, 
        #f8fafc ${Math.min(100, activeProgress + 2)}%, 
        #f1f5f9 ${Math.min(100, activeProgress + 4)}%, 
        #e2e8f0 ${Math.min(100, activeProgress + 8)}%, 
        #cbd5e1 ${Math.min(100, activeProgress + 12)}%, 
        #94a3b8 100%)`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat'
    };
  }

  const activeProgress = Math.max(0, progress);
  const fadeWidth = 15;

  // HSL로 변환하여 색상 조작
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 다양한 명도와 채도로 자연스러운 색상 변화 생성
  const colors = {
    // 기본 색상 (100% 강도)
    base: baseColor,

    // 90% 강도 - 약간 밝게
    step1: (() => {
      const rgb = hslToRgb(hsl.h, Math.min(100, hsl.s * 1.1), Math.min(100, hsl.l * 1.05));
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })(),

    // 75% 강도 - 더 밝고 연하게
    step2: (() => {
      const rgb = hslToRgb(hsl.h, Math.max(20, hsl.s * 0.8), Math.min(100, hsl.l * 1.15));
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })(),

    // 60% 강도 - 상당히 연하게
    step3: (() => {
      const rgb = hslToRgb(hsl.h, Math.max(15, hsl.s * 0.6), Math.min(100, hsl.l * 1.3));
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })(),

    // 40% 강도 - 매우 연하게
    step4: (() => {
      const rgb = hslToRgb(hsl.h, Math.max(10, hsl.s * 0.4), Math.min(100, hsl.l * 1.5));
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })(),

    // 20% 강도 - 거의 흰색에 가깝게
    step5: (() => {
      const rgb = hslToRgb(hsl.h, Math.max(5, hsl.s * 0.2), Math.min(100, hsl.l * 1.7));
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })()
  };

  // 회색 계열도 기본 색상의 색조를 약간 반영하도록 개선
  const neutralColors = {
    light1: (() => {
      const rgb = hslToRgb(hsl.h, 5, 97);  // 매우 연한 기본 색조
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })(),
    light2: (() => {
      const rgb = hslToRgb(hsl.h, 8, 94);  // 연한 기본 색조
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })(),
    medium1: (() => {
      const rgb = hslToRgb(hsl.h, 12, 88); // 중간 톤의 기본 색조
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })(),
    medium2: (() => {
      const rgb = hslToRgb(hsl.h, 15, 75); // 더 진한 기본 색조
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })(),
    dark: (() => {
      const rgb = hslToRgb(hsl.h, 20, 65);  // 가장 진한 기본 색조
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })()
  };

  return {
    backgroundImage: `linear-gradient(to right, 
      ${colors.base} 0%, 
      ${colors.base} ${Math.max(0, activeProgress - fadeWidth)}%, 
      ${colors.step1} ${Math.max(0, activeProgress - fadeWidth * 0.8)}%, 
      ${colors.step2} ${Math.max(0, activeProgress - fadeWidth * 0.6)}%, 
      ${colors.step3} ${Math.max(0, activeProgress - fadeWidth * 0.4)}%, 
      ${colors.step4} ${Math.max(0, activeProgress - fadeWidth * 0.2)}%, 
      ${colors.step5} ${activeProgress}%, 
      ${neutralColors.light1} ${Math.min(100, activeProgress + 2)}%, 
      ${neutralColors.light2} ${Math.min(100, activeProgress + 4)}%, 
      ${neutralColors.medium1} ${Math.min(100, activeProgress + 8)}%, 
      ${neutralColors.medium2} ${Math.min(100, activeProgress + 12)}%, 
      ${neutralColors.dark} 100%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat'
  };
}