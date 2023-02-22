import { Component, OnInit } from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../../stock-migrator/stock.service';
import {ZFTool} from '../../../helpers/zf-tool';
import {TgService} from '../tg.service';
import {PatternMapper} from '../../string-mauling/pattern-mapper/pattern-mapper';
import {UniqueStringsAndTokens} from '../../string-mauling/string-set/unique-strings';

@Component({
  selector: 'app-tg-migrator',
  templateUrl: './tg-migrator.component.html',
})
export class TgMigratorComponent implements OnInit {
  private _regExp: RegExp | undefined;
  patternMappers: PatternMapper[] = [];
  targetType = 'transgeneAllele';
  originalStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  residualStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public service: TgService,
  ) {
    this.appState.setActiveTool(ZFTool.TRANSGENE_MIGRATOR);
  }

  ngOnInit() {
    this.stockService.geneticsStrings.subscribe((sAndT: UniqueStringsAndTokens) => {
      this.originalStrings = sAndT;
    });
    this.service.patternMappers.subscribe((patternMappers: PatternMapper[]) => {
      this.patternMappers = patternMappers;
      this.doPatternMatching();
    })
  }

  regExpChanged(regExp: RegExp) {
    this.originalStrings.setFilter(regExp);
    this.residualStrings.setFilter(regExp);
    this._regExp = regExp;
  }
  // This is where the work happens
  doPatternMatching() {
    // Clear the existing results and start from scratch;
    this.residualStrings = new UniqueStringsAndTokens('Residual');
    for (const s of Object.keys(this.originalStrings.strings)) {
      let residual: string = s;
      for (const pm of this.patternMappers) {
        residual = pm.removedMatchedBitsFromString(residual);
      }
      this.residualStrings.addString(residual, this.originalStrings.strings[s]);
    }
    if (this._regExp) {
      this.residualStrings.setFilter(this._regExp);
    }
  }
}
