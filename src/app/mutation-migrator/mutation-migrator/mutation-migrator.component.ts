import { Component, OnInit } from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../../stock-migrator/stock.service';
import {ZFTool} from '../../../helpers/zf-tool';
import {MutationService} from '../mutation.service';

@Component({
  selector: 'app-mutation-migrator',
  templateUrl: './mutation-migrator.component.html',
})
export class MutationMigratorComponent implements OnInit {
  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public service: MutationService,
  ) {
    this.appState.setActiveTool(ZFTool.MUTATION_MIGRATOR);
  }

  ngOnInit() {
  }
}
