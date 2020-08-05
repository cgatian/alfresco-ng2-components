/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MinimalNodeEntryEntity } from '@alfresco/js-api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PreviewService } from '../../services/preview.service';

@Component({
    templateUrl: './version-manager-dialog-adapter.component.html',
    encapsulation: ViewEncapsulation.None
})
export class VersionManagerDialogAdapterComponent {

    public contentEntry: MinimalNodeEntryEntity;
    public newFileVersion: File;

    showComments = true;
    allowDownload = true;
    allowDirectDownload = false;
    readOnly = false;
    showVersionComparison = false;

    constructor(private previewService: PreviewService,
                @Inject(MAT_DIALOG_DATA) data: any,
                private snackBar: MatSnackBar,
                private containingDialog?: MatDialogRef<VersionManagerDialogAdapterComponent>) {
        this.contentEntry = data.contentEntry;
        this.newFileVersion = data.hasOwnProperty('newFileVersion') ? data.newFileVersion : this.newFileVersion;
        this.showComments = data.hasOwnProperty('showComments') ? data.showComments : this.showComments;
        this.allowDownload = data.hasOwnProperty('allowDownload') ? data.allowDownload : this.allowDownload;
        this.allowDirectDownload = data.hasOwnProperty('allowDirectDownload') ? data.allowDirectDownload : this.allowDirectDownload;
    }

    uploadError(errorMessage: string) {
        this.snackBar.open(errorMessage, '', {duration: 4000});
    }

    close() {
        this.containingDialog.close();
    }

    onViewVersion(versionId: string) {
        this.previewService.showResource(this.contentEntry.id, versionId);
        this.close();
    }

    hideVersionComparison(isCancelled: boolean | Node) {
        if (isCancelled) {
            this.showVersionComparison = false;
            this.newFileVersion = null;
        }
    }
}
