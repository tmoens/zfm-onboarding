import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSelectorComponent } from './user-selector/user-selector.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';
import {MatIconModule} from '@angular/material/icon';
import {UserEditorComponent } from './user-editor/user-editor.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyOptionModule as MatOptionModule} from '@angular/material/legacy-core';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
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
