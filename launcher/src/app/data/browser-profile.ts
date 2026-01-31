export interface BasicInfo {
    profileName: string | null;
    groupName?: string | null;
    description?: string | null;
}

export interface BotProfileInfo {
    filename: string | null;
    content?: string | null;
}

export enum BrowserProfileStatus {
    Idle,
    Launching,
    LaunchFailed,
    Running,
    Stopping,
    StopFailed,
}

export const BrowserProfileStatusText = {
    [BrowserProfileStatus.Idle]: 'Idle',
    [BrowserProfileStatus.Launching]: 'Launching',
    [BrowserProfileStatus.LaunchFailed]: 'Launch Failed',
    [BrowserProfileStatus.Running]: 'Running',
    [BrowserProfileStatus.Stopping]: 'Stopping',
    [BrowserProfileStatus.StopFailed]: 'Stop Failed',
};

export function getBrowserProfileStatusText(status: BrowserProfileStatus): string {
    return BrowserProfileStatusText[status];
}

export interface BrowserProfile {
    id: string;
    basicInfo: Partial<BasicInfo>;
    botProfileInfo: Partial<BotProfileInfo>;
    binaryPath: string;
    proxyServer?: string;
    createdAt: number;
    updatedAt: number;
    warmupUrls?: string;
    lastUsedAt?: number;
    deletedAt?: number;
}
