import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MutationMigratorRoutingModule} from './mutation-migrator-routing.module';
import {SharedModule} from '../shared/shared.module';
import {FlexModule} from '@angular/flex-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {StockMigratorModule} from '../stock-migrator/stock-migrator.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
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
    FlexModule,
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
