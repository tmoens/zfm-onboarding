import { Component, OnInit } from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../../stock-migrator/stock.service';
import {ZFTool} from '../../../helpers/zf-tool';
import {TgService} from '../tg.service';
import {UniqueStringsAndTokens} from '../../string-mauling/string-set/unique-strings';

@Component({
  selector: 'app-tg-migrator',
  templateUrl: './tg-migrator.component.html',
})
export class TgMigratorComponent implements OnInit {
  private _regExp: RegExp | undefined;
  originalStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  residualStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public tgService: TgService,
  ) {
    this.appState.setActiveTool(ZFTool.TRANSGENE_MIGRATOR);
  }

  ngOnInit() {
    this.stockService.geneticsStrings.subscribe((sAndT: UniqueStringsAndTokens) => {
      this.originalStrings = sAndT;
      if (this._regExp) {
        this.originalStrings.setFilter(this._regExp)
      }
    });
    this.stockService.residualGeneticsStrings.subscribe((sAndT: UniqueStringsAndTokens) => {
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
