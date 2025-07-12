import { Conference } from '@/types/conference';
import { PlayerState } from '@/types/conference-player';
import { isContentSection } from '@/types/conference-section';
import { PlayerStore } from '@/types/store';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const initialPlayerState: PlayerState = {
    isPlaying: false,
    currentTime: 0,
    currentSectionIndex: 0,
    currentSentenceIndex: 0,
    srcReady: false,
};

export const usePlayerStore = create<PlayerStore>()(
    devtools(
        subscribeWithSelector(
            immer((set, get) => ({
                // === State ===
                conference: null,
                playerData: null,
                playerState: initialPlayerState,
                isInitialized: false,
                autoPlayEnabled: true,

                // === Initialization Actions ===
                initialize: (conference: Conference) => {
                    set((state) => {
                        state.conference = conference;
                        state.playerData = conference.playerData;
                        state.playerState = initialPlayerState;
                        state.isInitialized = true;
                        state.autoPlayEnabled = true;
                    });
                },

                reset: () => {
                    set((state) => {
                        state.conference = null;
                        state.playerData = null;
                        state.playerState = initialPlayerState;
                        state.isInitialized = false;
                        state.autoPlayEnabled = true;
                    });
                },

                // === State Update Actions ===
                updatePlayerState: (updates: Partial<PlayerState>) => {
                    set((state) => {
                        Object.assign(state.playerState, updates);
                    });
                },

                setAutoPlayEnabled: (enabled: boolean) => {
                    set((state) => {
                        state.autoPlayEnabled = enabled;
                    });
                },

                // === Time-based Navigation ===
                seekToTime: (time: number) => {
                    const { playerData } = get();
                    if (!playerData) return;

                    const clampedTime = Math.max(0, Math.min(time, playerData.totalDuration));
                    const sectionInfo = get().getSectionAtTime(clampedTime);

                    if (sectionInfo) {
                        const { section, sectionIndex } = sectionInfo;
                        const sectionTime = clampedTime - section.startTime;

                        set((state) => {
                            state.playerState.currentTime = clampedTime;
                            state.playerState.currentSectionIndex = sectionIndex;

                            // 컨텐츠 섹션인 경우 문장 인덱스도 계산
                            if (isContentSection(section)) {
                                let sentenceIndex = 0;
                                for (let i = 0; i < section.sentences.length; i++) {
                                    const sentence = section.sentences[i];
                                    if (sectionTime >= sentence.startTime && sectionTime < sentence.endTime) {
                                        sentenceIndex = i;
                                        break;
                                    }
                                }
                                state.playerState.currentSentenceIndex = sentenceIndex;
                            } else {
                                state.playerState.currentSentenceIndex = 0;
                            }
                        });
                    }
                },

                seekToSection: (sectionIndex: number) => {
                    const { playerData } = get();
                    if (!playerData || sectionIndex < 0 || sectionIndex >= playerData.sections.length) {
                        return;
                    }

                    const section = playerData.sections[sectionIndex];
                    get().seekToTime(section.startTime);
                },

                seekToSentence: (sentenceIndex: number) => {
                    const { playerData, playerState } = get();
                    const currentSection = playerData?.sections[playerState.currentSectionIndex];

                    if (!currentSection || !isContentSection(currentSection)) {
                        return;
                    }

                    if (sentenceIndex < 0 || sentenceIndex >= currentSection.sentences.length) {
                        return;
                    }

                    const sentence = currentSection.sentences[sentenceIndex];
                    const absoluteTime = currentSection.startTime + sentence.startTime;
                    get().seekToTime(absoluteTime);
                },

                // === Simple Navigation ===
                goToNext: () => {
                    const { playerData, playerState } = get();
                    if (!playerData) return;

                    const currentSection = playerData.sections[playerState.currentSectionIndex];

                    if (isContentSection(currentSection)) {
                        // Try to go to next sentence first
                        if (playerState.currentSentenceIndex < currentSection.sentences.length - 1) {
                            get().seekToSentence(playerState.currentSentenceIndex + 1);
                            return;
                        }
                    }

                    // Go to next section
                    if (playerState.currentSectionIndex < playerData.sections.length - 1) {
                        get().seekToSection(playerState.currentSectionIndex + 1);
                    }
                },

                goToPrevious: () => {
                    const { playerData, playerState } = get();
                    if (!playerData) return;

                    const currentSection = playerData.sections[playerState.currentSectionIndex];

                    if (isContentSection(currentSection)) {
                        // Try to go to previous sentence first
                        if (playerState.currentSentenceIndex > 0) {
                            get().seekToSentence(playerState.currentSentenceIndex - 1);
                            return;
                        }
                    }

                    // Go to previous section
                    if (playerState.currentSectionIndex > 0) {
                        const prevSectionIndex = playerState.currentSectionIndex - 1;
                        const prevSection = playerData.sections[prevSectionIndex];

                        if (isContentSection(prevSection)) {
                            // Go to last sentence of previous content section
                            const lastSentenceIndex = prevSection.sentences.length - 1;
                            set((state) => {
                                state.playerState.currentSectionIndex = prevSectionIndex;
                                state.playerState.currentSentenceIndex = lastSentenceIndex;
                            });
                            get().seekToSentence(lastSentenceIndex);
                        } else {
                            get().seekToSection(prevSectionIndex);
                        }
                    }
                },

                // === Computed Getters ===
                getCurrentSection: () => {
                    const { playerData, playerState } = get();
                    return playerData?.sections[playerState.currentSectionIndex] || null;
                },

                getSectionAtTime: (time: number) => {
                    const { playerData } = get();
                    if (!playerData) return null;

                    for (let i = 0; i < playerData.sections.length; i++) {
                        const section = playerData.sections[i];
                        if (time >= section.startTime && time < section.endTime) {
                            return { section, sectionIndex: i };
                        }
                    }

                    return null;
                },

                getCurrentSentence: () => {
                    const { playerState } = get();
                    const currentSection = get().getCurrentSection();

                    if (!currentSection || !isContentSection(currentSection)) {
                        return null;
                    }

                    return currentSection.sentences[playerState.currentSentenceIndex] || null;
                },
            })),
        ),
        {
            name: 'conference-player-store',
            serialize: {
                options: {
                    map: true,
                },
            },
        }
    )
);

// === Selectors for Performance ===
export const playerSelectors = {
    // Basic state selectors
    state: (store: PlayerStore) => ({
        conference: store.conference,
        playerData: store.playerData,
        playerState: store.playerState,
        isInitialized: store.isInitialized,
        autoPlayEnabled: store.autoPlayEnabled,
    }),

    conference: (store: PlayerStore) => store.conference,
    playerData: (store: PlayerStore) => store.playerData,
    playerState: (store: PlayerStore) => store.playerState,

    // Computed selectors
    currentSection: (store: PlayerStore) => store.getCurrentSection(),
    currentSentence: (store: PlayerStore) => store.getCurrentSentence(),

    // Navigation state
    isFirstSection: (store: PlayerStore) => store.playerState.currentSectionIndex === 0,
    isLastSection: (store: PlayerStore) => {
        const playerData = store.playerData;
        if (!playerData) return true;

        const isLast = store.playerState.currentSectionIndex === playerData.sections.length - 1;
        if (!isLast) return false;

        const currentSection = store.getCurrentSection();
        if (isContentSection(currentSection)) {
            return store.playerState.currentSentenceIndex === currentSection.sentences.length - 1;
        }

        return true;
    },

    // Progress calculations
    overallProgress: (store: PlayerStore) => {
        const playerData = store.playerData;
        if (!playerData || playerData.totalDuration === 0) return 0;
        return (store.playerState.currentTime / playerData.totalDuration) * 100;
    },

    sectionProgress: (store: PlayerStore) => {
        const currentSection = store.getCurrentSection();
        if (!currentSection) return 0;

        const sectionTime = store.playerState.currentTime - currentSection.startTime;
        return Math.min(100, Math.max(0, (sectionTime / currentSection.duration) * 100));
    },

    // Individual state properties
    currentTime: (store: PlayerStore) => store.playerState.currentTime,
    isPlaying: (store: PlayerStore) => store.playerState.isPlaying,
    srcReady: (store: PlayerStore) => store.playerState.srcReady,
    autoPlayEnabled: (store: PlayerStore) => store.autoPlayEnabled,
};