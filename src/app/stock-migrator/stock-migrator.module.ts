import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {StockPatcherComponent } from './stock-patcher/stock-patcher.component';
import {StockMigratorRoutingModule} from './stock-migrator-routing.module';
import {StockProblemSelectorComponent } from './stock-problem-selector/stock-problem-selector.component';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {StockViewerComponent } from './stock-viewer/stock-viewer.component';
import {SharedModule} from '../shared/shared.module';
import { StockSelectorComponent } from './stock-selector/stock-selector.component';



@NgModule({
  declarations: [
    StockPatcherComponent,
    StockProblemSelectorComponent,
    StockViewerComponent,
    StockSelectorComponent,
  ],
  exports: [
    StockPatcherComponent,
    StockProblemSelectorComponent,
    StockSelectorComponent,
  ],
  imports: [
    StockMigratorRoutingModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatCardModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    SharedModule,
  ]
})
export class StockMigratorModule { }
