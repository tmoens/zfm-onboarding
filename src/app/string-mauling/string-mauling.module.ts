import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringSetComponent } from './string-set/string-set.component';
import { PatternMapperComponent } from './pattern-mapper/pattern-mapper.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import { MatchDetailsDialogComponent } from './pattern-mapper/match-details-dialog/match-details-dialog.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import { PatternMapperGroupComponent } from './pattern-mapper-group/pattern-mapper-group.component';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {SharedModule} from '../shared/shared.module';



@NgModule({
  declarations: [
    StringSetComponent,
    PatternMapperComponent,
    MatchDetailsDialogComponent,
    PatternMapperGroupComponent,
  ],
  exports: [
    StringSetComponent,
    PatternMapperComponent,
    PatternMapperGroupComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    SharedModule,
  ]
})
export class StringMaulingModule { }
