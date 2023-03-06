import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MutationMigratorRoutingModule} from './mutation-migrator-routing.module';
import {SharedModule} from '../shared/shared.module';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {StockMigratorModule} from '../stock-migrator/stock-migrator.module';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import { MutationEditorComponent } from './mutation-editor/mutation-editor.component';
import {StringMaulingModule} from '../string-mauling/string-mauling.module';
import { MutationSelectorComponent } from './mutation-selector/mutation-selector.component';



@NgModule({
  declarations: [
    MutationEditorComponent,
    MutationSelectorComponent,
  ],
  exports: [
    MutationSelectorComponent
  ],
  imports: [
    CommonModule,
    MutationMigratorRoutingModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    StockMigratorModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    StringMaulingModule,
  ]
})
export class MutationMigratorModule { }
