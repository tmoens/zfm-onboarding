import { Component, OnInit } from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../../stock-migrator/stock.service';
import {ZFTool} from '../../../helpers/zf-tool';
import {TgService} from '../tg.service';

@Component({
  selector: 'app-tg-migrator',
  templateUrl: './tg-migrator.component.html',
})
export class TgMigratorComponent implements OnInit {
  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public tgService: TgService,
  ) {
    this.appState.setActiveTool(ZFTool.TRANSGENE_MIGRATOR);
  }

  ngOnInit() {
  }
}
