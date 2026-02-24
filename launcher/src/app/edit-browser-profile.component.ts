import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, NgZone, type OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import * as Neutralino from '@neutralinojs/lib';
import { compact } from 'lodash-es';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { tryParseBotProfile, type BotProfileBasicInfo } from './data/bot-profile';
import {
    Architectures,
    Bitnesses,
    BrowserBrands,
    BrowserProfileStatus,
    ColorSchemes,
    FontOptions,
    MediaTypesOptions,
    Platforms,
    ProfileRealDisabledOptions,
    ProfileRealOptions,
    type BasicInfo,
    type BehaviorToggles,
    type BotProfileInfo,
    type BrowserProfile,
    type CustomUserAgentConfig,
    type DisplayInputConfig,
    type IdentityLocaleConfig,
    type LaunchOptions,
    type NoiseConfig,
    type ProxyConfig,
    type RenderingMediaConfig,
} from './data/browser-profile';
import type { Proxy } from './data/proxy';
import { AlertDialogComponent } from './shared/alert-dialog.component';
import { BrowserLauncherService } from './shared/browser-launcher.service';
import { BrowserProfileService } from './shared/browser-profile.service';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import type { ProxyCheckResult } from './shared/proxy-check.service';
import { ProxyInputComponent } from './shared/proxy-input.component';
import { ProxyParserService, type ParsedProxy } from './shared/proxy-parser.service';
import { ProxyService } from './shared/proxy.service';

@Component({
    selector: 'app-edit-browser-profile',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatExpansionModule,
        MatSlideToggleModule,
        AsyncPipe,
        ProxyInputComponent,
    ],
    templateUrl: './edit-browser-profile.component.html',
    styleUrl: './edit-browser-profile.component.scss',
})
export class EditBrowserProfileComponent implements OnInit {
    readonly #browserProfileService = inject(BrowserProfileService);
    readonly #browserLauncherService = inject(BrowserLauncherService);
    readonly #proxyService = inject(ProxyService);
    readonly #proxyParser = inject(ProxyParserService);

    #injectedData = inject<BrowserProfile | undefined>(MAT_DIALOG_DATA);

    readonly #formBuilder = inject(FormBuilder);
    readonly #dialog = inject(MatDialog);
    readonly #dialogRef = inject(MatDialogRef<EditBrowserProfileComponent>);
    readonly #ngZone = inject(NgZone);

    // Expose constants for template
    readonly browserBrands = BrowserBrands;
    readonly platforms = Platforms;
    readonly architectures = Architectures;
    readonly bitnesses = Bitnesses;
    readonly profileRealDisabledOptions = ProfileRealDisabledOptions;
    readonly profileRealOptions = ProfileRealOptions;
    readonly fontOptions = FontOptions;
    readonly mediaTypesOptions = MediaTypesOptions;
    readonly colorSchemes = ColorSchemes;

    readonly basicInfoFormGroup = this.#formBuilder.group<BasicInfo>({
        profileName: this.#injectedData?.basicInfo.profileName || 'New Profile',
        groupName: this.#injectedData?.basicInfo.groupName || '',
        description: this.#injectedData?.basicInfo.description || '',
    });

    #groupNames$ = new BehaviorSubject<string[]>([]);
    readonly filteredGroupNames = combineLatest([
        this.basicInfoFormGroup.get('groupName')!.valueChanges.pipe(startWith('')),
        this.#groupNames$,
    ]).pipe(
        map(([filterValue, groupNames]) => {
            const filter = (filterValue || '').toLowerCase();
            if (!filter) {
                return groupNames;
            }
            return groupNames.filter((option) => option.toLowerCase().includes(filter));
        })
    );

    readonly botProfileInfoGroup = this.#formBuilder.group<BotProfileInfo>({
        filename: this.#injectedData?.botProfileInfo.filename || '',
        content: this.#injectedData?.botProfileInfo.content,
    });

    readonly advancedGroup = this.#formBuilder.group({
        binaryPath: this.#injectedData?.binaryPath || '',
    });

    proxyValue: ParsedProxy | null = this.#injectedData?.proxyServer
        ? this.#proxyParser.parse(this.#injectedData.proxyServer)
        : null;
    selectedProxyId = '';

    // Behavior toggles - defaults:
    // DisableDebugger=true, DisableConsoleMessage=true, AlwaysActive=true
    readonly behaviorGroup = this.#formBuilder.group<BehaviorToggles>({
        botLocalDns: this.#injectedData?.launchOptions?.behavior?.botLocalDns,
        botDisableDebugger: this.#injectedData?.launchOptions?.behavior?.botDisableDebugger ?? true,
        botMobileForceTouch: this.#injectedData?.launchOptions?.behavior?.botMobileForceTouch,
        botAlwaysActive: this.#injectedData?.launchOptions?.behavior?.botAlwaysActive ?? true,
        botInjectRandomHistory: this.#injectedData?.launchOptions?.behavior?.botInjectRandomHistory,
        botDisableConsoleMessage: this.#injectedData?.launchOptions?.behavior?.botDisableConsoleMessage ?? true,
        botPortProtection: this.#injectedData?.launchOptions?.behavior?.botPortProtection,
    });

    // Identity & Locale - default: browserBrand=chrome
    readonly identityLocaleGroup = this.#formBuilder.group<IdentityLocaleConfig>({
        botConfigBrowserBrand: this.#injectedData?.launchOptions?.identityLocale?.botConfigBrowserBrand ?? 'chrome',
        botConfigBrandFullVersion: this.#injectedData?.launchOptions?.identityLocale?.botConfigBrandFullVersion,
        botConfigUaFullVersion: this.#injectedData?.launchOptions?.identityLocale?.botConfigUaFullVersion,
        botConfigLanguages: this.#injectedData?.launchOptions?.identityLocale?.botConfigLanguages,
        botConfigLocale: this.#injectedData?.launchOptions?.identityLocale?.botConfigLocale,
        botConfigTimezone: this.#injectedData?.launchOptions?.identityLocale?.botConfigTimezone,
        botConfigLocation: this.#injectedData?.launchOptions?.identityLocale?.botConfigLocation,
    });

    // Custom User-Agent
    readonly customUserAgentGroup = this.#formBuilder.group<CustomUserAgentConfig>({
        userAgent: this.#injectedData?.launchOptions?.customUserAgent?.userAgent,
        botConfigPlatform: this.#injectedData?.launchOptions?.customUserAgent?.botConfigPlatform,
        botConfigPlatformVersion: this.#injectedData?.launchOptions?.customUserAgent?.botConfigPlatformVersion,
        botConfigModel: this.#injectedData?.launchOptions?.customUserAgent?.botConfigModel,
        botConfigArchitecture: this.#injectedData?.launchOptions?.customUserAgent?.botConfigArchitecture,
        botConfigBitness: this.#injectedData?.launchOptions?.customUserAgent?.botConfigBitness,
        botConfigMobile: this.#injectedData?.launchOptions?.customUserAgent?.botConfigMobile,
    });

    // Display & Input - defaults: window/screen=real, keyboard/fonts=profile, colorScheme=light
    readonly displayInputGroup = this.#formBuilder.group<DisplayInputConfig>({
        botConfigWindow: this.#injectedData?.launchOptions?.displayInput?.botConfigWindow ?? 'real',
        botConfigScreen: this.#injectedData?.launchOptions?.displayInput?.botConfigScreen ?? 'real',
        botConfigKeyboard: this.#injectedData?.launchOptions?.displayInput?.botConfigKeyboard ?? 'profile',
        botConfigFonts: this.#injectedData?.launchOptions?.displayInput?.botConfigFonts ?? 'profile',
        botConfigColorScheme: this.#injectedData?.launchOptions?.displayInput?.botConfigColorScheme ?? 'light',
        botConfigDisableDeviceScaleFactor:
            this.#injectedData?.launchOptions?.displayInput?.botConfigDisableDeviceScaleFactor,
    });

    // Noise - defaults:
    // NoiseCanvas=true, NoiseWebglImage=true, NoiseAudioContext=true
    // NoiseClientRects=false, NoiseTextRects=true
    readonly noiseGroup = this.#formBuilder.group<NoiseConfig>({
        botConfigNoiseWebglImage: this.#injectedData?.launchOptions?.noise?.botConfigNoiseWebglImage ?? true,
        botConfigNoiseCanvas: this.#injectedData?.launchOptions?.noise?.botConfigNoiseCanvas ?? true,
        botConfigNoiseAudioContext: this.#injectedData?.launchOptions?.noise?.botConfigNoiseAudioContext ?? true,
        botConfigNoiseClientRects: this.#injectedData?.launchOptions?.noise?.botConfigNoiseClientRects,
        botConfigNoiseTextRects: this.#injectedData?.launchOptions?.noise?.botConfigNoiseTextRects ?? true,
        botNoiseSeed: this.#injectedData?.launchOptions?.noise?.botNoiseSeed,
        botTimeScale: this.#injectedData?.launchOptions?.noise?.botTimeScale,
    });

    // Rendering & Media - defaults: webgl/webgpu/speechVoices/mediaDevices/webrtc=profile, mediaTypes=expand
    readonly renderingMediaGroup = this.#formBuilder.group<RenderingMediaConfig>({
        botConfigWebgl: this.#injectedData?.launchOptions?.renderingMedia?.botConfigWebgl ?? 'profile',
        botConfigWebgpu: this.#injectedData?.launchOptions?.renderingMedia?.botConfigWebgpu ?? 'profile',
        botConfigSpeechVoices: this.#injectedData?.launchOptions?.renderingMedia?.botConfigSpeechVoices ?? 'profile',
        botConfigMediaDevices: this.#injectedData?.launchOptions?.renderingMedia?.botConfigMediaDevices ?? 'profile',
        botConfigMediaTypes: this.#injectedData?.launchOptions?.renderingMedia?.botConfigMediaTypes ?? 'expand',
        botConfigWebrtc: this.#injectedData?.launchOptions?.renderingMedia?.botConfigWebrtc ?? 'profile',
        botWebrtcIce: this.#injectedData?.launchOptions?.renderingMedia?.botWebrtcIce,
    });

    // Proxy config (advanced)
    readonly proxyConfigGroup = this.#formBuilder.group<ProxyConfig>({
        proxyServer: this.#injectedData?.launchOptions?.proxy?.proxyServer,
        proxyIp: this.#injectedData?.launchOptions?.proxy?.proxyIp,
        botIpService: this.#injectedData?.launchOptions?.proxy?.botIpService,
    });

    isEdit = false;
    basicInfo: BotProfileBasicInfo | null = null;
    proxies: Proxy[] = [];

    constructor() {
        if (this.#injectedData) {
            this.isEdit = true;

            const status = this.#browserLauncherService.getRunningStatus(this.#injectedData);
            if (status !== BrowserProfileStatus.Idle) {
                throw new Error('Cannot edit a running profile');
            }

            if (this.#injectedData.botProfileInfo.content) {
                this.basicInfo = tryParseBotProfile(this.#injectedData.botProfileInfo.content);
            }
        }

        this.#browserProfileService.getAllBrowserProfiles().then((profiles) => {
            this.#groupNames$.next(compact(profiles.map((profile) => profile.basicInfo.groupName)));
        });
    }

    async ngOnInit() {
        // Load proxies
        this.proxies = await this.#proxyService.getAllProxies();
    }

    onProxySelected(proxyId: string): void {
        if (!proxyId) {
            return;
        }
        const proxy = this.proxies.find((p) => p.id === proxyId);
        if (proxy) {
            this.proxyValue = {
                type: proxy.type,
                host: proxy.host,
                port: proxy.port,
                username: proxy.username,
                password: proxy.password,
            };
        }
    }

    onProxyValueChange(value: ParsedProxy | null): void {
        this.proxyValue = value;
    }

    onIpCheckResult(result: ProxyCheckResult): void {
        this.proxyConfigGroup.patchValue({ proxyIp: result.ip });
    }

    async chooseFile(): Promise<void> {
        let entries: string[];
        try {
            entries = await Neutralino.os.showOpenDialog('Select a profile', {
                filters: [{ name: 'Profiles', extensions: ['json', 'enc'] }],
                multiSelections: false,
            });
        } catch (error) {
            console.error('Failed to open file dialog:', error);
            this.#dialog.open(AlertDialogComponent, {
                data: { message: `Failed to open file dialog: ${error instanceof Error ? error.message : error}` },
            });
            return;
        }
        const entry = entries[0];
        if (!entry) return;

        if (!this.isEdit || !this.#injectedData?.botProfileInfo.content) {
            this.#handleFileSelection(entry);
            return;
        }

        // Re-selecting an existing botprofile may result in an unknown detection error
        this.#dialog
            .open(ConfirmDialogComponent, {
                data: {
                    defaultCancel: true,
                    message:
                        'Re-selecting an existing bot profile may result in an unknown detection error. Are you sure you want to proceed?',
                },
            })
            .afterClosed()
            .subscribe((result: boolean) => {
                if (!result) return;
                this.#handleFileSelection(entry);
            });
    }

    async chooseExecutable(): Promise<void> {
        let entries: string[];
        try {
            entries = await Neutralino.os.showOpenDialog('Select BotBrowser executable', {
                filters: [
                    { name: 'Executable', extensions: ['exe', 'app', ''] },
                    { name: 'All Files', extensions: ['*'] },
                ],
                multiSelections: false,
            });
        } catch (error) {
            console.error('Failed to open file dialog:', error);
            return;
        }
        const entry = entries[0];
        if (!entry) return;

        this.advancedGroup.get('binaryPath')?.setValue(entry);
    }

    #handleFileSelection(filePath: string): void {
        Neutralino.filesystem
            .readFile(filePath)
            .then((content) => {
                const basicInfo = tryParseBotProfile(content);
                if (!basicInfo) {
                    this.#dialog.open(AlertDialogComponent, {
                        data: { message: 'Invalid bot profile file.' },
                    });
                    return;
                }

                this.basicInfo = basicInfo;
                this.botProfileInfoGroup.get('content')?.setValue(content);
                this.botProfileInfoGroup.get('filename')?.setValue(filePath);

                // Auto-configure settings for Android profiles
                if (this.#isAndroidProfile(basicInfo)) {
                    this.displayInputGroup.patchValue({
                        botConfigWindow: 'profile',
                        botConfigScreen: 'profile',
                    });
                    this.behaviorGroup.patchValue({
                        botMobileForceTouch: true,
                    });
                }
            })
            .catch((error) => {
                console.error('Failed to read file:', error);
                this.#dialog.open(AlertDialogComponent, {
                    data: { message: `Failed to read file: ${error.message || error}` },
                });
            });
    }

    #isAndroidProfile(basicInfo: BotProfileBasicInfo): boolean {
        return basicInfo.userAgent.toLowerCase().includes('android');
    }

    #validate(): boolean {
        if (!this.basicInfo) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Bot profile must be selected and valid.' },
            });
            return false;
        }

        return true;
    }

    async onConfirmClick(): Promise<void> {
        console.log('onConfirmClick called');

        if (!this.#validate()) {
            console.log('validate failed');
            return;
        }
        console.log('validate passed');

        if (!this.basicInfoFormGroup.valid) {
            console.log('basicInfoFormGroup invalid');
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Please fill in all required fields.' },
            });
            return;
        }
        console.log('basicInfoFormGroup valid');

        if (!this.botProfileInfoGroup.value?.content) {
            console.log('botProfileInfoGroup content missing');
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Bot profile content is missing. Please select a valid profile file.' },
            });
            return;
        }
        console.log('botProfileInfoGroup content exists');

        const launchOptions: LaunchOptions = {
            behavior: this.#cleanObject(this.behaviorGroup.value) as BehaviorToggles | undefined,
            identityLocale: this.#cleanObject(this.identityLocaleGroup.value) as IdentityLocaleConfig | undefined,
            customUserAgent: this.#cleanObject(this.customUserAgentGroup.value) as CustomUserAgentConfig | undefined,
            displayInput: this.#cleanObject(this.displayInputGroup.value) as DisplayInputConfig | undefined,
            noise: this.#cleanObject(this.noiseGroup.value) as NoiseConfig | undefined,
            renderingMedia: this.#cleanObject(this.renderingMediaGroup.value) as RenderingMediaConfig | undefined,
            proxy: this.#cleanObject(this.proxyConfigGroup.value) as ProxyConfig | undefined,
        };

        const browserProfile: BrowserProfile = {
            id: this.#injectedData?.id || uuidv4(),
            basicInfo: this.basicInfoFormGroup.value,
            botProfileInfo: this.botProfileInfoGroup.value,
            binaryPath: this.advancedGroup.value.binaryPath || undefined,
            proxyServer: this.proxyValue ? this.#proxyParser.toUrl(this.proxyValue) : undefined,
            createdAt: this.#injectedData?.createdAt || Date.now(),
            lastUsedAt: this.#injectedData?.lastUsedAt,
            updatedAt: Date.now(),
            warmupUrls: this.#injectedData?.warmupUrls,
            launchOptions: this.#cleanObject(launchOptions),
        };

        try {
            console.log('Saving browser profile...');
            await this.#browserProfileService.saveBrowserProfile(browserProfile);
            console.log('Browser profile saved successfully');
            // Use NgZone to ensure dialog close triggers change detection
            this.#ngZone.run(() => {
                console.log('Closing dialog...');
                this.#dialogRef.close(true);
                console.log('Dialog close called');
            });
        } catch (error) {
            console.error('Failed to save browser profile:', error);
            this.#ngZone.run(() => {
                this.#dialog.open(AlertDialogComponent, {
                    data: { message: `Failed to save profile: ${error instanceof Error ? error.message : error}` },
                });
            });
        }
    }

    #cleanObject<T extends object>(obj: T): T | undefined {
        const cleaned = Object.fromEntries(
            Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '')
        ) as T;
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }
}
