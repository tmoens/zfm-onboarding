import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../app-state.service';
import {StockService} from '../stock-migrator/stock.service';
import {ZFTool} from '../../helpers/zf-tool';
import {UserService} from './user.service';
import {PatternMapper} from '../string-mauling/pattern-mapper/pattern-mapper';
import {UniqueStringsAndTokens} from '../string-mauling/string-set/unique-strings';
import {instanceToPlain, plainToInstance} from 'class-transformer';


@Component({
  selector: 'app-user-migrator',
  templateUrl: './user-migrator.component.html',
})
export class UserMigratorComponent implements OnInit {
  patternMappers: PatternMapper[] = [];
  targetType = "username";
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
    const storedPlainPatterns = this.appState.getState('userPatterns');
    if (storedPlainPatterns) {
      storedPlainPatterns.map((plainPattern: any) => {
       const pm: PatternMapper = plainToInstance(PatternMapper, plainPattern);
       pm.makeRegExpFromString();
       this.patternMappers.push(pm);
      })
    }
    if (this.patternMappers.length ===0) {
      this.addPatternMapper();
    }
    this.stockService.userStrings.subscribe((sAndT: UniqueStringsAndTokens) => {
      this.rawStrings = sAndT;
      this.doPatternMatching();
    });
  }

  addPatternMapper() {
    this.patternMappers.push(new PatternMapper());
  }

  deletePatternMapper(patternMapper: PatternMapper) {
    const index = this.patternMappers.indexOf(patternMapper);
    if (index >= 0) {
      this.patternMappers.splice(index, 1);
      this.doPatternMatching();
    }
  }
  // This is where the work happens
  doPatternMatching(){
    // Clear the existing results and start from scratch;
    const plainPatterns: any[] = [];
    this.patternMappers.map((pm: PatternMapper) => {
      pm.clearResults();
      plainPatterns.push(instanceToPlain(pm));
    })
    this.appState.setState('userPatterns', plainPatterns, true);
    this.residualStrings = new UniqueStringsAndTokens();
    for (const s of Object.keys(this.rawStrings.strings)) {
      let residual: string = s;
      for (const pm of this.patternMappers) {
        residual = pm.checkString(residual);
      }
      this.residualStrings.addString(residual);
    }
  }
}
