import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TgMigratorComponent } from './tg-migrator/tg-migrator.component';
import { TgEditorComponent } from './tg-editor/tg-editor.component';
import { TgSelectorComponent } from './tg-selector/tg-selector.component';



@NgModule({
  declarations: [
    TgMigratorComponent,
    TgEditorComponent,
    TgSelectorComponent
  ],
  imports: [
    CommonModule
  ]
})
export class TgMigratorModule { }
