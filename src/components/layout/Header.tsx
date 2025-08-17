import { FC } from 'react';
import { useIsMobile } from '@/utils/mobile-utils';

export const Header: FC = () => {
    const isMobile = useIsMobile();

    return (
        <header className={`
            relative z-10 flex items-center justify-between 
            ${isMobile ? 'px-4 sm:px-6 py-4 sm:py-6' : 'px-8 lg:px-12 py-6 lg:py-8'}
            transition-all duration-300
        `}>
            <h1 className={`
                font-bold text-white tracking-tight transition-all duration-300
                ${isMobile ? 'text-xl sm:text-2xl' : 'text-2xl md:text-3xl'}
            `}>
                Naco
            </h1>
            
            {/* 모바일에서는 더 간결하게, 데스크톱에서는 전체 텍스트 */}
            <div className="flex items-center">
                <span className={`
                    px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full 
                    text-white/80 font-bold transition-all duration-300
                    ${isMobile 
                        ? 'text-xs sm:text-sm' 
                        : 'text-sm'
                    }
                `}>
                    {isMobile ? 'Frontend' : 'Frontend Developer'}
                </span>
            </div>
        </header>
    );
};
