import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringSetComponent } from './string-set/string-set.component';
import {FlexModule} from '@angular/flex-layout';
import { PatternMapperComponent } from './pattern-mapper/pattern-mapper.component';



@NgModule({
  declarations: [
    StringSetComponent,
    PatternMapperComponent
  ],
  exports: [
    StringSetComponent
  ],
  imports: [
    CommonModule,
    FlexModule
  ]
})
export class StringMaulingModule { }
