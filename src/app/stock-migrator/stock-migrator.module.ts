import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {StockPatcherComponent } from './stock-patcher/stock-patcher.component';
import {StockMigratorRoutingModule} from './stock-migrator-routing.module';
import {StockSelectorComponent } from './stock-selector/stock-selector.component';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {StockViewerComponent } from './stock-viewer/stock-viewer.component';
import {SharedModule} from '../shared/shared.module';



@NgModule({
  declarations: [
    StockPatcherComponent,
    StockSelectorComponent,
    StockViewerComponent,
  ],
  exports: [
    StockPatcherComponent,
    StockSelectorComponent,
  ],
  imports: [
    StockMigratorRoutingModule,
    CommonModule,
    FlexLayoutModule,
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
