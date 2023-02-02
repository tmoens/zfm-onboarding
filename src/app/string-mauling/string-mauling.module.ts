import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringSetComponent } from './string-set/string-set.component';
import {FlexModule} from '@angular/flex-layout';
import { PatternMapperComponent } from './pattern-mapper/pattern-mapper.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';



@NgModule({
  declarations: [
    StringSetComponent,
    PatternMapperComponent,
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
    MatAutocompleteModule
  ]
})
export class StringMaulingModule { }
