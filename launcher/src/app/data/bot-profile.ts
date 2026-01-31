export type BotProfileBasicInfo = {
    version: string;
    userAgent: string;
    unmaskedVendor: string;
    unmaskedRenderer: string;
};

export function tryParseBotProfile(data: string): BotProfileBasicInfo | null {
    try {
        const info = JSON.parse(data);

        if (info.version && info.userAgent && info.unmaskedVendor && info.unmaskedRenderer) {
            return info;
        }

        return null;
    } catch {
        return null;
    }
}
