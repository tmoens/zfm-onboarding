import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import {PatchableAttrViewerComponent} from './patching/patchable-attr-viewer/patchable-attr-viewer.component';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {ReactiveFormsModule} from '@angular/forms';
import { RegExpInputComponent } from './reg-exp-input/reg-exp-input.component';


@NgModule({
  declarations: [
    PatchableAttrViewerComponent,
    RegExpInputComponent,
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  exports: [
    PatchableAttrViewerComponent,
    RegExpInputComponent,
  ]
})
export class SharedModule { }
