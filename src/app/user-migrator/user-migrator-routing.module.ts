import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ZFTool} from '../../helpers/zf-tool';
import {ResearcherMigratorComponent} from './researcher-migrator/researcher-migrator.component';
import {PiMigratorComponent} from './pi-migrator/pi-migrator.component';

const userMigratorRoutes: Routes = [
  {
    path: ZFTool.RESEARCHER_MIGRATOR.route,
    component: ResearcherMigratorComponent,
  },
  {
    path: ZFTool.PI_MIGRATOR.route,
    component: PiMigratorComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(userMigratorRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class UserMigratorRoutingModule { }
