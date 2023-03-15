import { Component } from '@angular/core';
import {UniqueStringsAndTokens} from '../../string-mauling/string-set/unique-strings';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../../stock-migrator/stock.service';
import {ZFTool} from '../../../helpers/zf-tool';
import {PiService} from '../pi.service';

@Component({
  selector: 'app-pi-migrator',
  templateUrl: './pi-migrator.component.html'
})
export class PiMigratorComponent {

  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public piService: PiService,
  ) {
    this.appState.setActiveTool(ZFTool.PI_MIGRATOR);
  }


  ngOnInit() {
  }
}
