import React, { FC, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile, useIsTouchDevice } from '@/utils/mobile-utils';
import { TOUCH_TARGET } from '@/utils/constants';

interface Props {
    onClick: () => void;
}

export const GoBackButton: FC<Props> = ({ onClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const isMobile = useIsMobile();
    const isTouchDevice = useIsTouchDevice();

    // 모바일에서는 터치로, 데스크톱에서는 호버로 제어
    const handleInteractionStart = () => {
        if (isTouchDevice) {
            setIsExpanded(!isExpanded);
            setIsPressed(true);
        } else {
            setIsExpanded(true);
        }
    };

    const handleInteractionEnd = () => {
        if (!isTouchDevice) {
            setIsExpanded(false);
        }
        setIsPressed(false);
    };

    const handleClick = () => {
        onClick();
        // 클릭 후 상태 초기화
        if (isTouchDevice) {
            setIsExpanded(false);
        }
    };

    // 모바일에 최적화된 크기
    const buttonWidth = isExpanded ? (isMobile ? '120px' : '140px') : `${TOUCH_TARGET.COMFORTABLE_SIZE}px`;
    const buttonHeight = `${TOUCH_TARGET.COMFORTABLE_SIZE}px`;

    return (
        <button
            onClick={handleClick}
            onMouseEnter={!isTouchDevice ? handleInteractionStart : undefined}
            onMouseLeave={!isTouchDevice ? handleInteractionEnd : undefined}
            onTouchStart={isTouchDevice ? handleInteractionStart : undefined}
            onTouchEnd={isTouchDevice ? handleInteractionEnd : undefined}
            className={`
                group relative flex items-center justify-center overflow-hidden 
                bg-black/20 backdrop-blur-xl rounded-full border border-white/10 
                hover:bg-black/30 hover:border-white/20 
                transition-all duration-500 ease-out hover:scale-105 
                hover:shadow-2xl hover:shadow-blue-500/10
                ${isPressed ? 'scale-95' : ''}
                ${isMobile ? 'active:scale-95' : ''}
            `}
            style={{
                width: buttonWidth,
                height: buttonHeight,
                minWidth: `${TOUCH_TARGET.MIN_SIZE}px`,
                minHeight: `${TOUCH_TARGET.MIN_SIZE}px`,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {/* 글로우 효과 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

            {/* 아이콘과 텍스트 컨테이너 */}
            <div className="relative flex items-center justify-center w-full h-full">
                {/* 아이콘 */}
                <ArrowLeft
                    className="w-6 h-6 text-white/90 group-hover:text-white transition-all duration-300 absolute"
                    style={{
                        transform: isExpanded ? `translateX(${isMobile ? '-35px' : '-45px'})` : 'translateX(0)',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                />

                {/* 텍스트 */}
                <span
                    className={`
                        text-white/95 font-medium tracking-wide whitespace-nowrap absolute
                        ${isMobile ? 'text-xs' : 'text-sm'}
                    `}
                    style={{
                        opacity: isExpanded ? 1 : 0,
                        transform: isExpanded ? `translateX(${isMobile ? '6px' : '8px'})` : 'translateX(-10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transitionDelay: isExpanded ? '0.1s' : '0s'
                    }}
                >
                    세션 나가기
                </span>
            </div>

            {/* 리플 효과 */}
            <div className="absolute inset-0 rounded-full bg-white/5 scale-0 group-active:scale-110 transition-transform duration-200" />

            {/* 미세한 하이라이트 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
    );
};