import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ZFTool} from '../../helpers/zf-tool';
import {UserMigratorComponent} from './user-migrator.component';

const userMigratorRoutes: Routes = [
  {
    path: ZFTool.USER_MIGRATOR.route,
    component: UserMigratorComponent,
  }
];
// children: [
//   {
//     path: 'patch/:id',
//     component: StockPatcherComponent,
//   },
// ]

@NgModule({
  imports: [
    RouterModule.forChild(userMigratorRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class UserMigratorRoutingModule { }
