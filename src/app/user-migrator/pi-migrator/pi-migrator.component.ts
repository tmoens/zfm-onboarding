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
  private _regExp: RegExp | undefined;
  originalStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  residualStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();

  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public piService: PiService,
  ) {
    this.appState.setActiveTool(ZFTool.PI_MIGRATOR);
  }


  ngOnInit() {
    this.stockService.piStrings.subscribe((sAndT: UniqueStringsAndTokens) => {
      this.originalStrings = sAndT;
      if (this._regExp) {
        this.originalStrings.setFilter(this._regExp)
      }
    });
    this.stockService.residualPiStrings.subscribe((sAndT: UniqueStringsAndTokens) => {
      this.residualStrings = sAndT;
      if (this._regExp) {
        this.residualStrings.setFilter(this._regExp)
      }
    });
  }

  regExpChanged(regExp: RegExp) {
    this._regExp = regExp;
    this.originalStrings.setFilter(regExp);
    this.residualStrings.setFilter(regExp);
  }
}
