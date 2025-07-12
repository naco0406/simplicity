import { ConferencePlayerData } from '@/types/conference-player';

/**
 * 컨퍼런스 ID에 해당하는 JSON 파일을 불러와서 ConferencePlayerData 타입으로 반환합니다.
 * @param id 컨퍼런스 ID
 * @returns Promise<ConferencePlayerData>
 */
export async function loadConferenceData(id: string): Promise<ConferencePlayerData> {
    try {
        const response = await fetch(`/conferences/${id}.json`);

        if (!response.ok) {
            throw new Error(`Failed to load conference data for ID: ${id}`);
        }

        const data = await response.json();

        // 타입 검증
        if (!isValidConferencePlayerData(data)) {
            throw new Error(`Invalid conference data format for ID: ${id}`);
        }

        return data;
    } catch (error) {
        console.error(`Error loading conference data for ID ${id}:`, error);
        throw error;
    }
}

/**
 * ConferencePlayerData 타입의 유효성을 검증합니다.
 * @param data 검증할 데이터
 * @returns boolean
 */
function isValidConferencePlayerData(data: any): data is ConferencePlayerData {
    // 기본 필수 필드 검증
    if (!data || typeof data !== 'object') return false;
    if (typeof data.id !== 'string') return false;
    if (typeof data.totalDuration !== 'number') return false;
    if (typeof data.srcUrl !== 'string') return false;
    if (!Array.isArray(data.sections)) return false;

    // sections 배열 검증
    for (const section of data.sections) {
        if (!isValidSection(section)) return false;
    }

    return true;
}

/**
 * Section 타입의 유효성을 검증합니다.
 * @param section 검증할 섹션
 * @returns boolean
 */
function isValidSection(section: any): boolean {
    if (!section || typeof section !== 'object') return false;
    if (typeof section.id !== 'string') return false;
    if (typeof section.title !== 'string') return false;
    if (typeof section.type !== 'string') return false;
    if (typeof section.duration !== 'number') return false;
    if (typeof section.startTime !== 'number') return false;
    if (typeof section.endTime !== 'number') return false;

    // type에 따른 추가 검증
    switch (section.type) {
        case 'intro':
            return isValidIntroSection(section);
        case 'content':
            return isValidContentSection(section);
        case 'closing':
            return isValidClosingSection(section);
        default:
            return false;
    }
}

/**
 * IntroSection 타입의 유효성을 검증합니다.
 * @param section 검증할 섹션
 * @returns boolean
 */
function isValidIntroSection(section: any): boolean {
    if (typeof section.mainTitle !== 'string') return false;
    if (typeof section.subtitle !== 'string') return false;
    if (typeof section.speaker !== 'string') return false;
    if (typeof section.role !== 'string') return false;
    return true;
}

/**
 * ContentSection 타입의 유효성을 검증합니다.
 * @param section 검증할 섹션
 * @returns boolean
 */
function isValidContentSection(section: any): boolean {
    if (typeof section.audioSegmentIndex !== 'number') return false;
    if (!Array.isArray(section.sentences)) return false;

    // sentences 배열 검증
    for (const sentence of section.sentences) {
        if (!isValidSentence(sentence)) return false;
    }

    return true;
}

/**
 * ClosingSection 타입의 유효성을 검증합니다.
 * @param section 검증할 섹션
 * @returns boolean
 */
function isValidClosingSection(section: any): boolean {
    if (typeof section.message !== 'string') return false;
    if (!Array.isArray(section.credits)) return false;

    // credits 배열 검증
    for (const credit of section.credits) {
        if (typeof credit !== 'string') return false;
    }

    return true;
}

/**
 * Sentence 타입의 유효성을 검증합니다.
 * @param sentence 검증할 문장
 * @returns boolean
 */
function isValidSentence(sentence: any): boolean {
    if (!sentence || typeof sentence !== 'object') return false;
    if (typeof sentence.id !== 'string') return false;
    if (typeof sentence.text !== 'string') return false;
    if (typeof sentence.startTime !== 'number') return false;
    if (typeof sentence.endTime !== 'number') return false;
    return true;
}

/**
 * 사용 가능한 컨퍼런스 ID 목록을 반환합니다.
 * @returns Promise<string[]>
 */
export async function getAvailableConferenceIds(): Promise<string[]> {
    try {
        // 실제 환경에서는 서버에서 사용 가능한 ID 목록을 가져올 수 있습니다.
        // 현재는 정적으로 정의된 ID들을 반환합니다.
        return ['1', '2', '3', '4', '5', '6'];
    } catch (error) {
        console.error('Error getting available conference IDs:', error);
        return [];
    }
} 