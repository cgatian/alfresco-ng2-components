/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
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

import { Injector } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { CoreModule } from 'ng2-alfresco-core';
import { DataTableComponent } from '../components/datatable/datatable.component';
import { LoadingContentTemplateDirective } from './loading-template.directive';

describe('LoadingContentTemplateDirective', () => {
    let injector: Injector;
    let loadingContentTemplateDirective: LoadingContentTemplateDirective;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CoreModule.forRoot()
            ],
            providers: [
                LoadingContentTemplateDirective,
                DataTableComponent
            ]
        });
        injector = getTestBed();
        loadingContentTemplateDirective = injector.get(LoadingContentTemplateDirective);
    });

    it('is defined', () => {
        expect(loadingContentTemplateDirective).toBeDefined();
    });
});
