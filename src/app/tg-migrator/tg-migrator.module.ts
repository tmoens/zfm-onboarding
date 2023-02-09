import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TgEditorComponent } from './tg-editor/tg-editor.component';
import { TgSelectorComponent } from './tg-selector/tg-selector.component';
import {TgMigratorRoutingModule} from './tg-migrator-routing.module';
import {FlexModule} from '@angular/flex-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {StockMigratorModule} from '../stock-migrator/stock-migrator.module';
import {SharedModule} from '../shared/shared.module';



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
    FlexModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    StockMigratorModule,
  ]
})
export class TgMigratorModule { }
