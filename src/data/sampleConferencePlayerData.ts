import { ConferencePlayerData } from '@/types/conference-player';
import { INTRO_TIME } from '@/utils/constants';

export const sampleConferencePlayerData: ConferencePlayerData = {
    id: 'simplicity-24-enhanced',
    totalDuration: 92000,
    srcUrl: '/audios/sample-audio.mp3',
    sections: [
        {
            id: 'intro-section',
            title: '웰컴',
            type: 'intro',
            duration: INTRO_TIME,
            startTime: 0,
            endTime: INTRO_TIME,
            mainTitle: '서소희 • 모두가 유저를 만나는 순간까지',
            subtitle: 'SIMPLICITY 24',
            speaker: '서소희',
            role: 'Toss UX Designer'
        },
        {
            id: 'content-section-1',
            title: '유저 리서치의 중요성',
            type: 'content',
            duration: 45000,
            startTime: INTRO_TIME,
            endTime: INTRO_TIME + 45000,
            audioSegmentIndex: 0,
            sentences: [
                {
                    id: 'sentence-1',
                    text: '안녕하세요, 토스에서 UX 디자이너로 일하고 있는 서소희입니다.',
                    startTime: 0,
                    endTime: 4500
                },
                {
                    id: 'sentence-2',
                    text: '오늘은 다양한 토스 사용자들과 15분에서 30분 동안 인터뷰를 할 수 있는 프로그램에 대해 이야기하려고 합니다.',
                    startTime: 4500,
                    endTime: 12000
                },
                {
                    id: 'sentence-3',
                    text: '이 프로그램은 정말 유용하고 신청도 가능합니다.',
                    startTime: 12000,
                    endTime: 16500
                },
                {
                    id: 'sentence-4',
                    text: '사용자의 실제 목소리를 들을 수 있는 것은 디자이너에게 매우 중요한 경험입니다.',
                    startTime: 16500,
                    endTime: 24000
                },
                {
                    id: 'sentence-5',
                    text: '우리가 만든 제품이 실제로 어떻게 사용되는지 직접 확인할 수 있기 때문입니다.',
                    startTime: 24000,
                    endTime: 31500
                },
                {
                    id: 'sentence-6',
                    text: '가정이나 추측이 아닌 실제 데이터와 피드백을 받을 수 있습니다.',
                    startTime: 31500,
                    endTime: 38000
                },
                {
                    id: 'sentence-7',
                    text: '이러한 인사이트는 더 나은 사용자 경험을 만드는 데 핵심적인 역할을 합니다.',
                    startTime: 38000,
                    endTime: 45000
                }
            ]
        },
        {
            id: 'content-section-2',
            title: '인터뷰 프로세스',
            type: 'content',
            duration: 42000,
            startTime: INTRO_TIME + 45000,
            endTime: INTRO_TIME + 45000 + 42000,
            audioSegmentIndex: 1,
            sentences: [
                {
                    id: 'sentence-8',
                    text: '인터뷰 프로세스는 매우 체계적으로 진행됩니다.',
                    startTime: 0,
                    endTime: 4500
                },
                {
                    id: 'sentence-9',
                    text: '먼저 참가자를 모집하고, 적절한 질문을 준비한 다음 인터뷰를 진행합니다.',
                    startTime: 4500,
                    endTime: 11500
                },
                {
                    id: 'sentence-10',
                    text: '각 인터뷰는 녹화되며, 나중에 팀 전체가 함께 분석할 수 있습니다.',
                    startTime: 11500,
                    endTime: 18000
                },
                {
                    id: 'sentence-11',
                    text: '이를 통해 우리는 사용자의 니즈와 페인 포인트를 명확히 파악할 수 있습니다.',
                    startTime: 18000,
                    endTime: 25500
                },
                {
                    id: 'sentence-12',
                    text: '그리고 이런 인사이트를 바탕으로 제품을 개선하고 새로운 기능을 개발합니다.',
                    startTime: 25500,
                    endTime: 33000
                },
                {
                    id: 'sentence-13',
                    text: '사용자 중심의 디자인이야말로 성공적인 제품의 핵심이라고 생각합니다.',
                    startTime: 33000,
                    endTime: 42000
                }
            ]
        },
        {
            id: 'closing-section',
            title: '마무리',
            type: 'closing',
            duration: 10000,
            startTime: 92000,
            endTime: 102000,
            message: '감사합니다',
            credits: [
                '발표자: 서소희 (Toss UX Designer)',
                'SIMPLICITY 24 Conference',
                '토스팀 전체의 지원에 감사드립니다'
            ]
        }
    ]
};
