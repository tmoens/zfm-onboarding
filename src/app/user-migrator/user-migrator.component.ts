import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../app-state.service';
import {StockService} from '../stock-migrator/stock.service';
import {ZFTool} from '../../helpers/zf-tool';
import {UserService} from './user.service';
import {PatternMapper} from '../string-mauling/pattern-mapper/pattern-mapper';
import {UniqueStringsAndTokens} from '../string-mauling/string-set/unique-strings';


@Component({
  selector: 'app-user-migrator',
  templateUrl: './user-migrator.component.html',
})
export class UserMigratorComponent implements OnInit {
  patternMappers: PatternMapper[] = [];
  rawStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  residualStrings: UniqueStringsAndTokens = new UniqueStringsAndTokens();
  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public userService: UserService,
  ) {
    this.appState.setActiveTool(ZFTool.USER_MIGRATOR);
  }


  ngOnInit() {
    this.userService.patternMappers.subscribe((patternMappers: PatternMapper[]) => {
      this.patternMappers = patternMappers;
      this.doPatternMatching();
    })
    this.stockService.userStrings.subscribe((sAndT: UniqueStringsAndTokens) => {
      this.rawStrings = sAndT;
      this.doPatternMatching();
    });
  }

  // This is where the work happens
  doPatternMatching() {
    // Clear the existing results and start from scratch;
    this.residualStrings = new UniqueStringsAndTokens();
    for (const s of Object.keys(this.rawStrings.strings)) {
      let residual: string = s;
      for (const pm of this.patternMappers) {
        residual = pm.removedMatchedBitsFromString(residual);
      }
      this.residualStrings.addString(residual);
    }
  }
}
