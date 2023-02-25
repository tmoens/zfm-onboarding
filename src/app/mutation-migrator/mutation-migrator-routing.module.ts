import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ZFTool} from '../../helpers/zf-tool';
import {MutationMigratorComponent} from './mutation-migrator/mutation-migrator.component';

const mutationMigratorRoutes: Routes = [
  {
    path: ZFTool.MUTATION_MIGRATOR.route,
    component: MutationMigratorComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(mutationMigratorRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class MutationMigratorRoutingModule { }
