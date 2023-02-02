import {Component, OnInit, ViewChild} from '@angular/core';
import {AppStateService} from '../app-state.service';
import {StockService} from '../stock-migrator/stock.service';
import {ZFTool} from '../../helpers/zf-tool';
import {UserService} from './user.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PatternMapper} from '../string-mauling/pattern-mapper/patternMapper';


@Component({
  selector: 'app-user-migrator',
  templateUrl: './user-migrator.component.html',
})
export class UserMigratorComponent implements OnInit {
  test: string[] = [];
  patternMappers: PatternMapper[] = [];
  targetType = "User";
  sidenavOptions = {
    fixed: true,
  }
  constructor(
    private fb: FormBuilder,
    public appState: AppStateService,
    public stockService: StockService,
    public userService: UserService,
  ) {
    this.appState.setActiveTool(ZFTool.USER_MIGRATOR);
  }

  ngOnInit() {
    this.addPattern();
    this.userService.uniqueNames.subscribe((strings: string[]) => this.test = strings);
  }

  addPattern() {
    this.patternMappers.push(new PatternMapper());
  }

  deletePattern(patternMapper: PatternMapper) {
    const index = this.patternMappers.indexOf(patternMapper);
    if (index >= 0) {
      this.patternMappers.splice(index, 1);
    }
  }
}
