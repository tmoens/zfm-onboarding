import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringSetComponent } from './string-set/string-set.component';
import {FlexModule} from '@angular/flex-layout';
import { PatternMapperComponent } from './pattern-mapper/pattern-mapper.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatchDetailsDialogComponent } from './pattern-mapper/match-details-dialog/match-details-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import { PatternMapperGroupComponent } from './pattern-mapper-group/pattern-mapper-group.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
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
    FlexModule,
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
