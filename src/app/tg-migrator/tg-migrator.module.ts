import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TgEditorComponent } from './tg-editor/tg-editor.component';
import { TgSelectorComponent } from './tg-selector/tg-selector.component';
import {TgMigratorRoutingModule} from './tg-migrator-routing.module';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {StockMigratorModule} from '../stock-migrator/stock-migrator.module';
import {SharedModule} from '../shared/shared.module';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';



@NgModule({
  declarations: [
    TgEditorComponent,
    TgSelectorComponent
  ],
  exports: [
    TgSelectorComponent
  ],
  imports: [
    CommonModule,
    TgMigratorRoutingModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    StockMigratorModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
  ]
})
export class TgMigratorModule { }
