'use client';

import { ConferencePlayer } from '@/components/conference/player/ConferencePlayer';
import { useConference } from '@/hooks/useConference';
import { useConferenceData } from '@/hooks/useConferenceData';
import { useParams } from 'next/navigation';
import { FC } from 'react';

const ConferencePage: FC = () => {
    const params = useParams();
    const { conference } = useConference();
    const { data: playerData, loading, error } = useConferenceData(params.id as string);

    // 로딩 상태
    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>컨퍼런스 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error || !playerData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-2">컨퍼런스 데이터를 불러올 수 없습니다.</p>
                    <p className="text-gray-400 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <ConferencePlayer data={conference} playerData={playerData} />
    );
};

export default ConferencePage;