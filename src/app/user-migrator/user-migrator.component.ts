import { Component, OnInit } from '@angular/core';
import {AppStateService} from '../app-state.service';
import {StockService} from '../stock-migrator/stock.service';
import {ZFTool} from '../../helpers/zf-tool';
import {UserService} from './user.service';

@Component({
  selector: 'app-user-migrator',
  templateUrl: './user-migrator.component.html',
})
export class UserMigratorComponent {

  sidenavOptions = {
    fixed: true,
  }
  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public service: UserService,
  ) {
    this.appState.setActiveTool(ZFTool.USER_MIGRATOR);
  }
}
