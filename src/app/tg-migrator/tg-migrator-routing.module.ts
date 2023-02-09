import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ZFTool} from '../../helpers/zf-tool';
import {TgMigratorComponent} from './tg-migrator/tg-migrator.component';

const transgeneMigratorRoutes: Routes = [
  {
    path: ZFTool.TRANSGENE_MIGRATOR.route,
    component: TgMigratorComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(transgeneMigratorRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class TgMigratorRoutingModule { }
