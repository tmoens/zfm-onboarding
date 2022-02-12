import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../app-state.service';
import {StockService} from './stock.service';
import {ZFTool} from '../../helpers/zf-tool';

/**
 * Present a view for the user to look at problems, select one and patch it.
 */


@Component({
  selector: 'app-stock-migrator',
  templateUrl: './stock-migrator.component.html',
  styleUrls: ['./stock-migrator.component.scss']
})
export class StockMigratorComponent {
  sidenavOptions = {
    fixed: true,
  }
  constructor(
    public appState: AppStateService,
    public service: StockService,
  ) {
    this.appState.setActiveTool(ZFTool.STOCK_MIGRATOR);
  }
}
