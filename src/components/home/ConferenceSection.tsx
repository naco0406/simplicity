import { ConferenceGrid } from '@/components/home/ConferenceGrid';
import { Conference } from '@/types/conference';
import { FC, memo } from 'react';

interface Props {
    conferences: Conference[];
}
export const ConferenceSection: FC<Props> = memo(({
    conferences,
}) => {

    return (
        <section className="relative w-full h-full items-center">
            <div
                className="transition-all duration-1000 opacity-100 translate-y-0 h-full items-center py-24"
                style={{ transitionDelay: '0.3s' }}
            >
                <ConferenceGrid conferences={conferences} />
            </div>
        </section>
    );
});
