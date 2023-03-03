import { Component, OnInit } from '@angular/core';
import {Stock} from '../stock';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../stock.service';

const STOCK_PROBLEM_FOCUS_STATE = 'stockProblemFocusState';


@Component({
  selector: 'app-stock-problem-selector',
  templateUrl: './stock-problem-selector.component.html',
})


export class StockProblemSelectorComponent implements OnInit {

  problemStocks: Stock[] = [];

  // The stock that the user is currently patching
  problemFocus: string | null = null;
  patched: boolean = true;
  constructor(
    public appState: AppStateService,
    public service: StockService,
  ) {
  }

  ngOnInit(): void {
    this.problemFocus = this.appState.getState(STOCK_PROBLEM_FOCUS_STATE);
    this.getFilteredStocks();
  }

  focusOnProblemArea() {
    this.appState.setState(STOCK_PROBLEM_FOCUS_STATE, this.problemFocus, true);
    this.getFilteredStocks();
  }

  getFilteredStocks() {
    this.problemStocks = this.service.filterByProblemArea(this.problemFocus);
  }


  // When the user chooses a stock, set up the environment for patching it.
  stockSelected(stock: Stock) {
    this.service.selectItem(stock);
  }
}
