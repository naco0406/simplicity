import { ConferencePlayerData } from "./conference-player";

export interface ConferenceData {
    id: string;
    title: string;
    subtitle: string;
    speaker: string;
    role: string;
    description: string;
    image: string;
}

export interface Conference {
    data: ConferenceData
    playerData: ConferencePlayerData
}