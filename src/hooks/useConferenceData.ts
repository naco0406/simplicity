import { ConferencePlayerData } from '@/types/conference-player';
import { loadConferenceData } from '@/utils/conference-loader';
import { useEffect, useState } from 'react';

interface UseConferenceDataResult {
    data: ConferencePlayerData | null;
    loading: boolean;
    error: string | null;
}

/**
 * 컨퍼런스 ID에 해당하는 데이터를 불러오는 훅
 * @param id 컨퍼런스 ID
 * @returns UseConferenceDataResult
 */
export function useConferenceData(id: string): UseConferenceDataResult {
    const [data, setData] = useState<ConferencePlayerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!id) {
                setError('Conference ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const conferenceData = await loadConferenceData(id);

                if (isMounted) {
                    setData(conferenceData);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load conference data');
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    return { data, loading, error };
} 