import { Component, OnInit } from '@angular/core';
import {Stock} from '../stock';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../stock.service';
import {Router} from '@angular/router';
import {ZFTool} from '../../../helpers/zf-tool';

const STOCK_PROBLEM_FOCUS_STATE = 'stockProblemFocusState';


@Component({
  selector: 'app-stock-selector',
  templateUrl: './stock-selector.component.html',
})


export class StockSelectorComponent implements OnInit {

  filteredStocks: Stock[] = [];

  // The stock that the user is currently patching
  selectedStock: Stock | null = null;
  problemFocus: string | null = null;
  patched: boolean = true;
  constructor(
    public appState: AppStateService,
    public service: StockService,
    private router: Router
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
    this.filteredStocks = this.service.filterByProblemArea(this.problemFocus);
  }


  // When the user chooses a stock, set up the environment for patching it.
  stockSelected(stock: Stock) {
    this.selectedStock = stock;
    this.router.navigate([ZFTool.STOCK_MIGRATOR.route + '/patch/' + stock.index]).then();
  }

}
