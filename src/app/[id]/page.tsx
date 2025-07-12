'use client';

import { ConferencePlayer } from '@/components/conference/player/ConferencePlayer';
import { sampleConferencePlayerData } from '@/data/sampleConferencePlayerData';
import { useConference } from '@/hooks/useConference';
import { FC } from 'react';

const ConferencePage: FC = () => {
    const { conference } = useConference();
    return (
        <ConferencePlayer data={conference} playerData={sampleConferencePlayerData} />
    );
};

export default ConferencePage;