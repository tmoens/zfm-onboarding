import { Component, OnInit } from '@angular/core';
import {UniqueStringsAndTokens} from '../../string-mauling/string-set/unique-strings';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../../stock-migrator/stock.service';
import {ZFTool} from '../../../helpers/zf-tool';
import {MutationService} from '../mutation.service';

@Component({
  selector: 'app-mutation-migrator',
  templateUrl: './mutation-migrator.component.html',
})
export class MutationMigratorComponent implements OnInit {
  private _regExp: RegExp | undefined;
  originalStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  residualStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public service: MutationService,
  ) {
    this.appState.setActiveTool(ZFTool.MUTATION_MIGRATOR);
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
    this.originalStrings.setFilter(regExp);
    this.residualStrings.setFilter(regExp);
    this._regExp = regExp;
  }
}
