import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ZFTool} from '../../helpers/zf-tool';
import {StockMigratorComponent} from './stock-migrator.component';

const stockMigratorRoutes: Routes = [
  {
    path: ZFTool.STOCK_MIGRATOR.route,
    component: StockMigratorComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(stockMigratorRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class StockMigratorRoutingModule { }
