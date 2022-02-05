import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../app-state.service';
import {StockProblem, StockProblemFields} from './stock-problem';
import {StockService} from './stock.service';
import {Stock} from './stock';
import {StockPatch} from './stock-patch';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs';

/**
 * Present a view for the user to look at problems, select one and patch it.
 */

const STOCK_PROBLEM_FOCUS_STATE = 'stockProblemFocus';

@Component({
  selector: 'app-stock-migrator',
  templateUrl: './stock-migrator.component.html',
  styleUrls: ['./stock-migrator.component.css']
})
export class StockMigratorComponent implements OnInit {
  stockProblemFields: string[] = Object.values(StockProblemFields);

  // What type of problem is the user focusing on.  null is no focus = all problems.
  stockProblemFocus: string | null = null;

  // The stock and problem the user is currently working on (patching)
  selectedStock: Stock | null = null;
  selectedPatch: StockPatch | undefined;

  constructor(
    public appState: AppStateService,
    public service: StockService,
  ) {
  }

  ngOnInit(): void {
    const focus = this.appState.getState(STOCK_PROBLEM_FOCUS_STATE);
    if (focus) {
      this.stockProblemFocus = focus as string;
    }
  }

  focusOnProblemType() {
    this.appState.setState(STOCK_PROBLEM_FOCUS_STATE, this.stockProblemFocus, true);
  }

  // When the user chooses a stock, set up the environment for patching it.
  stockSelected(stock: Stock) {
    this.selectedStock = stock;

    // find a patch for the stock if it exists, otherwise create a new patch for it.
    // we can't patch stocks with duplicates because patches are keyed on stock name,
    // so we cannot disambiguate which patch is for which of the duplicates.
    if (this.selectedStock.hasDuplicates()) {
      this.selectedPatch = undefined;
    } else {
      this.selectedPatch = this.service.getPatchForStock(this.selectedStock);
    }
  }

}


