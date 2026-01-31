/// <reference path="../../neutralino/neutralino.d.ts" />

import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as Neutralino from '@neutralinojs/lib';
import { AppName } from '../const';
import { BrowserProfileStatus, getBrowserProfileStatusText, type BrowserProfile } from '../data/browser-profile';
import { SimpleCDP } from '../simple-cdp';
import { createDirectoryIfNotExists, sleep } from '../utils';
import { AlertDialogComponent } from './alert-dialog.component';
import { BrowserProfileService } from './browser-profile.service';

export interface RunningInfo {
    browserProfileId: string;
    status: BrowserProfileStatus;
    spawnProcessInfo?: Neutralino.SpawnedProcess;
    resolver?: any;
}

@Injectable({ providedIn: 'root' })
export class BrowserLauncherService {
    readonly #browserProfileService = inject(BrowserProfileService);
    readonly #runningStatuses = new Map<string, RunningInfo>();
    readonly #dialog = inject(MatDialog);

    constructor() {
        Neutralino.events.on('spawnedProcess', (evt) => {
            switch (evt.detail.action) {
                case 'stdOut':
                    console.log('stdOut', evt.detail.data);
                    break;
                case 'stdErr':
                    {
                        console.error('stdErr', evt.detail.data);
                        const rgx = /\bws:\/\/.*\/devtools\/browser\/.*\b/;
                        const match = evt.detail.data.match(rgx);
                        const wsURL = match?.[0];

                        if (wsURL) {
                            const runningInfo = Array.from(this.#runningStatuses.values()).find(
                                (info) => info.spawnProcessInfo?.id === evt.detail.id
                            );

                            if (!runningInfo) {
                                throw new Error(`No running info found for id: ${evt.detail.id}`);
                            }

                            runningInfo.resolver?.resolve(wsURL);
                        }
                    }
                    break;
                case 'exit':
                    console.log(`process terminated with exit code: ${evt.detail.data} id: ${evt.detail.id}`);

                    const runningInfo = Array.from(this.#runningStatuses.values()).find(
                        (info) => info.spawnProcessInfo?.id === evt.detail.id
                    );
                    if (!runningInfo) {
                        throw new Error(`No running info found for id: ${evt.detail.id}`);
                    }

                    runningInfo.status = BrowserProfileStatus.Idle;
                    runningInfo.spawnProcessInfo = undefined;

                    break;
            }
        });
    }

    async getUserDataDirPath(): Promise<string> {
        const systemDataPath = await Neutralino.os.getPath('data');
        const result = await Neutralino.filesystem.getJoinedPath(systemDataPath, AppName, 'user-data-dirs');

        try {
            await Neutralino.filesystem.getStats(result);
        } catch {
            await Neutralino.filesystem.createDirectory(result);
        }

        return result;
    }

    getRunningStatus(browserProfile: string | BrowserProfile): BrowserProfileStatus {
        const id = typeof browserProfile === 'string' ? browserProfile : browserProfile.id;
        return this.#runningStatuses.get(id)?.status ?? BrowserProfileStatus.Idle;
    }

    getRunningStatusText(browserProfile: string | BrowserProfile): string {
        return getBrowserProfileStatusText(this.getRunningStatus(browserProfile));
    }

    async run(browserProfile: BrowserProfile, warmup = false): Promise<void> {
        const osInfo = await Neutralino.computer.getOSInfo();
        const osType = osInfo.name;

        if (this.getRunningStatus(browserProfile) !== BrowserProfileStatus.Idle) {
            throw new Error('The profile is already running');
        }

        let botProfileObject: any | undefined;
        try {
            botProfileObject = JSON.parse(browserProfile.botProfileInfo.content ?? '');
        } catch (error) {
            console.error('Error parsing bot profile content: ', error);
        }

        if (!botProfileObject) {
            this.#dialog.open(AlertDialogComponent, { data: { message: 'Bot profile content is empty, cannot run' } });
            return;
        }

        const sysTempPath = await Neutralino.os.getPath('temp');

        // Save bot profile
        const botProfileContent = JSON.stringify(botProfileObject);
        const botProfilesBasePath = await Neutralino.filesystem.getJoinedPath(sysTempPath, AppName, 'bot-profiles');
        await createDirectoryIfNotExists(botProfilesBasePath);
        const botProfilePath = await Neutralino.filesystem.getJoinedPath(
            botProfilesBasePath,
            `${browserProfile.id}.json`
        );
        await Neutralino.filesystem.writeFile(botProfilePath, botProfileContent);

        // Save browser profile
        browserProfile.lastUsedAt = Date.now();
        await this.#browserProfileService.saveBrowserProfile(browserProfile);

        const browserProfilePath = await this.#browserProfileService.getBrowserProfilePath(browserProfile);
        const userDataDirPath = await Neutralino.filesystem.getJoinedPath(browserProfilePath, 'user-data-dir');
        const diskCacheDirPath = await Neutralino.filesystem.getJoinedPath(
            sysTempPath,
            AppName,
            'disk-cache-dir',
            browserProfile.id
        );

        let execPath: string;
        if (browserProfile.binaryPath) {
            if (osType.includes('Darwin')) {
                if (browserProfile.binaryPath.endsWith('.app')) {
                    execPath = await Neutralino.filesystem.getJoinedPath(
                        browserProfile.binaryPath,
                        'Contents',
                        'MacOS',
                        'Chromium'
                    );
                } else {
                    execPath = browserProfile.binaryPath;
                }
            } else {
                execPath = browserProfile.binaryPath;
            }
        } else {
            execPath = await Neutralino.filesystem.getJoinedPath(NL_PATH, 'Chromium');
        }

        console.log('Neutralino NL_PATH: ', NL_PATH);
        console.log('Chromium path: ', execPath);

        console.log('Starting browser with profile: ', browserProfile.id);
        console.log('Bot profile path: ', botProfilePath);
        console.log('User data dir path: ', userDataDirPath);
        console.log('Disk cache dir path: ', diskCacheDirPath);

        const args = [
            '--allow-pre-commit-input',
            '--enable-automation',
            '--metrics-recording-only',
            '--no-first-run',
            '--password-store=basic',
            '--use-mock-keychain',
            '--restore-last-session',
            '--disable-blink-features=AutomationControlled',
            `--user-data-dir="${userDataDirPath}"`,
            `--disk-cache-dir="${diskCacheDirPath}"`,
            '--bot-local-dns',
            '--bot-webrtc-ice=google',
            '--bot-mobile-force-touch',
            '--bot-always-active',
            `--bot-profile="${botProfilePath}"`,
        ];

        if (browserProfile.proxyServer) {
            args.push(`--proxy-server=${browserProfile.proxyServer}`);
        }

        if (browserProfile.basicInfo.profileName) {
            args.push(`--bot-title="${browserProfile.basicInfo.profileName}"`);
        }

        const runningInfo: RunningInfo = { browserProfileId: browserProfile.id, status: BrowserProfileStatus.Running };

        const warmupUrls = (browserProfile.warmupUrls ?? '').split('\n');
        if (!warmupUrls.length) warmup = false;

        if (warmup) {
            args.push('--remote-debugging-port=0');
            args.push('--remote-allow-origins="*"');

            runningInfo.resolver = {};
            runningInfo.resolver.promise = new Promise<string>((resolve) => {
                runningInfo.resolver.resolve = resolve;
            });
        }

        const proc = await Neutralino.os.spawnProcess(`"${execPath}" ${args.join(' ')}`);
        runningInfo.spawnProcessInfo = proc;

        this.#runningStatuses.set(browserProfile.id, runningInfo);

        if (warmup) {
            console.log('Waiting for WS URL, browserProfile.id: ', browserProfile.id);
            const wsURL = await runningInfo.resolver.promise;
            console.log('We got WS URL: ', wsURL);

            const simpleCDP = new SimpleCDP(wsURL);
            try {
                await simpleCDP.connect();
                const targets = await simpleCDP.getTargets();
                console.log('Targets: ', targets);
                const pageTarget = targets.find((t) => t.type === 'page');
                const sessionId = await simpleCDP.attachToTarget(pageTarget.targetId);
                console.log('Session ID: ', sessionId);

                for (const warmupUrl of warmupUrls) {
                    console.log('Navigating to: ', warmupUrl);
                    await simpleCDP.navigate(sessionId, warmupUrl);
                    await sleep(Math.floor(Math.random() * 8000) + 5000);
                }
            } finally {
                simpleCDP.close();
            }
        }
    }

    async stop(browserProfile: BrowserProfile): Promise<void> {
        if (this.getRunningStatus(browserProfile) !== BrowserProfileStatus.Running) {
            throw new Error('The profile is not running');
        }

        const runningInfo = this.#runningStatuses.get(browserProfile.id);
        if (!runningInfo || !runningInfo.spawnProcessInfo) {
            throw new Error('No running info found');
        }

        runningInfo.status = BrowserProfileStatus.Stopping;
        await Neutralino.os.updateSpawnedProcess(runningInfo.spawnProcessInfo.id, 'exit');
    }
}
