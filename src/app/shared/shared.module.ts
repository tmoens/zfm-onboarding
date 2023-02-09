import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import {PatchableAttrViewerComponent} from './patching/patchable-attr-viewer/patchable-attr-viewer.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    PatchableAttrViewerComponent,
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    MatIconModule,
    MatFormFieldModule,
    FlexLayoutModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  exports: [
    PatchableAttrViewerComponent,
  ]
})
export class SharedModule { }
