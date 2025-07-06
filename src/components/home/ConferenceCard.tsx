import { Conference } from '@/types/conference';
import { CARD_CONSTANTS } from '@/utils/constants';
import { FC, memo } from 'react';

interface Props {
    conference: Conference;
    index: number;
    isVisible: boolean;
    isFocused?: boolean;
    dynamicHeight?: number;
    onCardClick?: (index: number) => void;
}

export const ConferenceCard: FC<Props> = memo(({
    conference,
    index,
    isVisible,
    isFocused = false,
    dynamicHeight = CARD_CONSTANTS.BASE_HEIGHT,
    onCardClick
}) => {
    const cardDelay = index * 0.1;

    const handleClick = () => {
        if (!isFocused && onCardClick) {
            onCardClick(index);
        }
    };

    return (
        <div
            className={`
                relative group mx-4 cursor-pointer
                transition-all duration-500 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                ${isFocused ? 'z-10' : 'z-0'}
            `}
            style={{
                transitionDelay: `${cardDelay}s`,
                width: `${CARD_CONSTANTS.WIDTH}px`,
                scrollSnapAlign: 'center'
            }}
            data-card-index={index}
            onClick={handleClick}
        >
            <div
                className={`
                    relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 
                    backdrop-blur-sm border border-white/20 
                    transition-all duration-300 ease-out
                    ${isFocused
                        ? 'shadow-xl shadow-blue-500/20'
                        : 'shadow-xl hover:shadow-xl hover:shadow-white/10 hover:border-white/30'
                    }
                `}
                style={{ 
                    height: `${dynamicHeight}px`,
                    boxShadow: isFocused ? '0 0 20px rgba(96, 165, 250, 0.3)' : undefined
                }}
            >
                {/* 포커스 상태 그라디언트 테두리 */}
                {isFocused && (
                    <div 
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                            background: 'linear-gradient(135deg, #60a5fa, #a855f7)',
                            padding: '2px',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'exclude'
                        }}
                    />
                )}
                {/* 포커스 상태 글로우 효과 */}
                {isFocused && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-2xl animate-pulse" />
                )}

                {/* 이미지 섹션 */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={conference.image}
                        alt={conference.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* 이미지 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* 콘텐츠 섹션 */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {conference.title}
                    </h3>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {conference.description}
                    </p>
                </div>
            </div>
        </div>
    );
});
