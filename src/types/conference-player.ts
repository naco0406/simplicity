import { Section } from "./conference-section";

export interface ConferencePlayerData {
    id: string;
    sections: Section[];
    srcUrl: string;
    totalDuration: number;
}

export interface PlayerState {
    isPlaying: boolean;
    currentTime: number; // 전체 컨퍼런스 기준 시간
    currentSectionIndex: number;
    currentSentenceIndex: number; // 컨텐츠 섹션에서만 사용
    srcReady: boolean;
}

export interface PlayerActions {
    togglePlayPause: () => Promise<void>;
    goToPrevious: () => void;
    goToNext: () => void;
    seekToSection: (sectionIndex: number) => void;
    seekToSentence: (sentenceIndex: number) => void;
    seekToTime: (time: number) => void;
}
