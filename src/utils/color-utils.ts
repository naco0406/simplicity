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
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
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