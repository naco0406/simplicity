import React, { FC, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    onClick: () => void;
}

export const GoBackButton: FC<Props> = ({ onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex items-center justify-center overflow-hidden bg-black/20 backdrop-blur-xl rounded-full border border-white/10 hover:bg-black/30 hover:border-white/20 transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
            style={{
                width: isHovered ? '140px' : '48px',
                height: '48px',
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
                        transform: isHovered ? 'translateX(-45px)' : 'translateX(0)',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                />

                {/* 텍스트 */}
                <span
                    className="text-white/95 font-medium text-sm tracking-wide whitespace-nowrap absolute"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateX(8px)' : 'translateX(-10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transitionDelay: isHovered ? '0.1s' : '0s'
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