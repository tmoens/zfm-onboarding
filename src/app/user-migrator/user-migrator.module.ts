import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSelectorComponent } from './user-selector/user-selector.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {UserEditorComponent } from './user-editor/user-editor.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {StockMigratorModule} from '../stock-migrator/stock-migrator.module';
import {UserMigratorRoutingModule} from './user-migrator-routing.module';
import {SharedModule} from '../shared/shared.module';



@NgModule({
  declarations: [
    UserSelectorComponent,
    UserEditorComponent,
  ],
  exports: [
    UserSelectorComponent,
  ],
  imports: [
    UserMigratorRoutingModule,
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    StockMigratorModule,
    SharedModule,
  ]
})
export class UserMigratorModule { }
