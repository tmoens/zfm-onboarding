import {Component} from '@angular/core';
import {AppStateService} from '../app-state.service';
import {StockService} from './stock.service';
import {ZFTool} from '../../helpers/zf-tool';

/**
 * Present a view for the user to look at problems, select one and patch it.
 */


@Component({
  selector: 'app-stock-migrator',
  templateUrl: './stock-migrator.component.html',
})
export class StockMigratorComponent {
  constructor(
    public appState: AppStateService,
    public service: StockService,
  ) {
    this.appState.setActiveTool(ZFTool.STOCK_MIGRATOR);
  }
}
