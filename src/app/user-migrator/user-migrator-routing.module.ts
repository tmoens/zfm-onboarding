import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ZFTool} from '../../helpers/zf-tool';
import {ResearcherMigratorComponent} from './researcher-migrator/researcher-migrator.component';

const userMigratorRoutes: Routes = [
  {
    path: ZFTool.USER_MIGRATOR.route,
    component: ResearcherMigratorComponent,
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
