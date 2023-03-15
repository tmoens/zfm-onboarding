import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../../stock-migrator/stock.service';
import {ZFTool} from '../../../helpers/zf-tool';
import {ResearcherService} from '../researcher.service';

@Component({
  selector: 'app-researcher-migrator',
  templateUrl: './researcher-migrator.component.html',
})
export class ResearcherMigratorComponent implements OnInit {

  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public researcherService: ResearcherService,
  ) {
    this.appState.setActiveTool(ZFTool.RESEARCHER_MIGRATOR);
  }


  ngOnInit() {
  }
}
