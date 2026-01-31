import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormsModule,
    ReactiveFormsModule,
    type ValidationErrors,
    type ValidatorFn,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import * as Neutralino from '@neutralinojs/lib';
import { compact } from 'lodash-es';
import { map, startWith } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { tryParseBotProfile, type BotProfileBasicInfo } from './data/bot-profile';
import { BrowserProfileStatus, type BasicInfo, type BotProfileInfo, type BrowserProfile } from './data/browser-profile';
import { AlertDialogComponent } from './shared/alert-dialog.component';
import { BrowserLauncherService } from './shared/browser-launcher.service';
import { BrowserProfileService } from './shared/browser-profile.service';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';

/**
 * Validates `binaryPath` based on the operating system type.
 * @param osType Operating system type: 'Darwin' | 'Windows' | 'Linux'
 * @returns ValidatorFn
 */
export function binaryPathValidator(osType: 'Darwin' | 'Windows' | 'Linux'): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
        const binaryPathControl = group.get('binaryPath');

        // Get the value of binaryPath from the form group
        const binaryPath = group.get('binaryPath')?.value;

        let error: ValidationErrors | null = null;
        if (!binaryPath) {
            error = { invalidBinaryPath: 'Binary path is required' };
        } else {
            switch (osType) {
                case 'Darwin': // macOS
                    if (!binaryPath.endsWith('.app')) {
                        error = {
                            invalidBinaryPath: 'On macOS, path must end with .app',
                        };
                    }
                    break;

                case 'Windows': // Windows
                    if (!binaryPath.endsWith('.exe')) {
                        error = {
                            invalidBinaryPath: 'On Windows, path must end with .exe',
                        };
                    }
                    break;

                case 'Linux': // Linux
                    if (binaryPath !== 'chromium') {
                        error = {
                            invalidBinaryPath: 'On Linux, path must be "chromium"',
                        };
                    }
                    break;

                default:
                    error = { invalidOS: 'Unsupported OS type' };
            }
        }

        // Apply the error directly to the FormControl
        if (error) {
            binaryPathControl?.setErrors(error);
            return error;
        } else {
            binaryPathControl?.setErrors(null);
        }

        return null;
    };
}

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
        MatStepperModule,
        MatAutocompleteModule,
        AsyncPipe,
    ],
    templateUrl: './edit-browser-profile.component.html',
    styleUrl: './edit-browser-profile.component.scss',
})
export class EditBrowserProfileComponent implements OnInit {
    readonly #browserProfileService = inject(BrowserProfileService);
    readonly #browserLauncherService = inject(BrowserLauncherService);

    #injectedData = inject<BrowserProfile | undefined>(MAT_DIALOG_DATA);

    readonly #formBuilder = inject(FormBuilder);
    readonly #dialog = inject(MatDialog);
    readonly #dialogRef = inject(MatDialogRef<EditBrowserProfileComponent>);

    readonly basicInfoFormGroup = this.#formBuilder.group<BasicInfo>({
        profileName: this.#injectedData?.basicInfo.profileName || 'New Profile',
        groupName: this.#injectedData?.basicInfo.groupName || '',
        description: this.#injectedData?.basicInfo.description || '',
    });

    #groupNames: string[] = [];
    readonly filteredGroupNames = this.basicInfoFormGroup.valueChanges.pipe(
        startWith(this.basicInfoFormGroup.value),
        map((value) => {
            const filterValue = value.groupName?.toLowerCase();
            return this.#groupNames.filter((option) => option.toLowerCase().includes(filterValue || ''));
        })
    );

    readonly botProfileInfoGroup = this.#formBuilder.group<BotProfileInfo>({
        filename: this.#injectedData?.botProfileInfo.filename || '',
        content: this.#injectedData?.botProfileInfo.content,
    });
    readonly proxyInfoGroup = this.#formBuilder.group<{
        proxyServer?: string;
    }>({ proxyServer: this.#injectedData?.proxyServer });
    variablesInfoGroup = this.#formBuilder.group<{
        binaryPath?: string;
    }>({
        binaryPath: this.#injectedData?.binaryPath,
    });

    isEdit = false;
    basicInfo: BotProfileBasicInfo | null = null;

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
            this.#groupNames = compact(profiles.map((profile) => profile.basicInfo.groupName));
        });
    }

    async ngOnInit() {
        const osInfo = await Neutralino.computer.getOSInfo();
        let osType: 'Darwin' | 'Windows' | 'Linux' = 'Darwin';

        if (osInfo.name.includes('Darwin')) {
            osType = 'Darwin';
        } else if (osInfo.name.includes('Windows')) {
            osType = 'Windows';
        } else if (osInfo.name.includes('Linux')) {
            osType = 'Linux';
        }

        // Initialize the FormGroup with default values and the custom validator
        this.variablesInfoGroup = this.#formBuilder.group<{
            binaryPath?: string;
        }>({ binaryPath: this.#injectedData?.binaryPath }, { validators: binaryPathValidator(osType) });
    }

    async chooseFile(): Promise<void> {
        const entries = await Neutralino.os.showOpenDialog('Select a profile', {
            filters: [{ name: 'Profiles', extensions: ['json', 'enc'] }],
            multiSelections: false,
        });
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

    #handleFileSelection(filePath: string): void {
        Neutralino.filesystem.readFile(filePath).then((content) => {
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
        });
    }

    #validateVariablesInfo(): boolean {
        if (!this.basicInfo) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Bot profile must be selected and valid.' },
            });
            return false;
        }

        const binaryPath = this.variablesInfoGroup.get('binaryPath')?.value;

        if (!binaryPath) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Binary path is required.' },
            });
            this.variablesInfoGroup.get('binaryPath')?.setErrors({ required: true });
            return false;
        }

        this.variablesInfoGroup.updateValueAndValidity();

        if (this.variablesInfoGroup.invalid) {
            const errors = this.variablesInfoGroup.get('binaryPath')?.errors;
            if (errors?.invalidBinaryPath) {
                this.#dialog.open(AlertDialogComponent, {
                    data: { message: errors.invalidBinaryPath },
                });
            }
            return false;
        }

        return true;
    }

    async onConfirmClick(): Promise<void> {
        if (!this.#validateVariablesInfo()) {
            return;
        }

        if (
            !this.basicInfoFormGroup.valid ||
            !this.variablesInfoGroup.valid ||
            !this.botProfileInfoGroup.value?.content
        ) {
            return;
        }

        const browserProfile: BrowserProfile = {
            id: this.#injectedData?.id || uuidv4(),
            basicInfo: this.basicInfoFormGroup.value,
            botProfileInfo: this.botProfileInfoGroup.value,
            proxyServer: this.proxyInfoGroup.value.proxyServer || undefined,
            binaryPath: this.variablesInfoGroup.value.binaryPath || '',
            createdAt: this.#injectedData?.createdAt || Date.now(),
            lastUsedAt: this.#injectedData?.lastUsedAt,
            updatedAt: Date.now(),
            warmupUrls: this.#injectedData?.warmupUrls,
        };

        await this.#browserProfileService.saveBrowserProfile(browserProfile);
        this.#dialogRef.close();
    }
}
