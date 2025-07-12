import { SentenceTiming } from "./conference-timing";

export interface BaseSection {
    id: string;
    title: string;
    duration: number;
    startTime: number; // 전체 컨퍼런스에서의 시작 시간
    endTime: number;   // 전체 컨퍼런스에서의 종료 시간
}

export interface IntroSection extends BaseSection {
    type: 'intro';
    mainTitle: string;
    subtitle?: string;
    speaker?: string;
    role?: string;
}

export interface ContentSection extends BaseSection {
    type: 'content';
    sentences: SentenceTiming[];
    audioSegmentIndex: number;
}

export interface ClosingSection extends BaseSection {
    type: 'closing';
    message: string;
    credits?: string[];
}

export type Section = IntroSection | ContentSection | ClosingSection;

export const isIntroSection = (section: Section): section is IntroSection => {
    return section.type === 'intro';
};

export const isContentSection = (section: Section): section is ContentSection => {
    return section.type === 'content';
};

export const isClosingSection = (section: Section): section is ClosingSection => {
    return section.type === 'closing';
};
