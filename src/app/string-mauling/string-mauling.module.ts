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



@NgModule({
  declarations: [
    StringSetComponent,
    PatternMapperComponent,
    MatchDetailsDialogComponent,
  ],
  exports: [
    StringSetComponent,
    PatternMapperComponent,
  ],
  imports: [
    CommonModule,
    FlexModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDialogModule,
  ]
})
export class StringMaulingModule { }
