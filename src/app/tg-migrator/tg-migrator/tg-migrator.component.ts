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
  patternMappers: PatternMapper[] = [];
  targetType = 'transgeneAllele';
  rawStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  residualStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public service: TgService,
  ) {
    this.appState.setActiveTool(ZFTool.USER_MIGRATOR);
  }

  ngOnInit() {
    this.service.patternMappers.subscribe((patternMappers: PatternMapper[]) => {
      this.patternMappers = patternMappers;
      this.doPatternMatching();
    })
    this.stockService.geneticsStrings.subscribe((sAndT: UniqueStringsAndTokens) => {
      this.rawStrings = sAndT;
      this.doPatternMatching();
    });
  }

  onChange(pm: PatternMapper) {
    this.service.saveAndExportPatternMappers();
  }
  // This is where the work happens
  doPatternMatching() {
    // Clear the existing results and start from scratch;
    this.residualStrings = new UniqueStringsAndTokens();
    for (const s of Object.keys(this.rawStrings.strings)) {
      let residual: string = s;
      for (const pm of this.patternMappers) {
        residual = pm.removeMatches(residual);
      }
      this.residualStrings.addString(residual, this.rawStrings.strings[s]);
    }
  }
}
