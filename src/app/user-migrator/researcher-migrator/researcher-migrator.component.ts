import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../../stock-migrator/stock.service';
import {ZFTool} from '../../../helpers/zf-tool';
import {UserService} from '../user.service';

@Component({
  selector: 'app-researcher-migrator',
  templateUrl: './researcher-migrator.component.html',
})
export class ResearcherMigratorComponent implements OnInit {

  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public researcherService: UserService,
  ) {
    this.appState.setActiveTool(ZFTool.USER_MIGRATOR);
  }


  ngOnInit() {
  }
}
