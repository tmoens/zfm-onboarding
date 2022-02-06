import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockViewerComponent } from './stock-viewer/stock-viewer.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import { StockBrowserComponent } from './stock-browser/stock-browser.component';
import {MatCardModule} from '@angular/material/card';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { StockPatcherComponent } from './stock-patcher/stock-patcher.component';



@NgModule({
  declarations: [
    StockViewerComponent,
    StockBrowserComponent,
    StockPatcherComponent
  ],
  exports: [
    StockViewerComponent,
    StockBrowserComponent,
    StockPatcherComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatCardModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class StockMigratorModule { }
