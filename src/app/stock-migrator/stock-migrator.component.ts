import {Component, OnInit} from '@angular/core';
import {AppStateService, WellKnownStates} from '../app-state.service';
import * as XLSX from 'xlsx';
import {HttpClient} from '@angular/common/http';
import {Stock} from './stock';
import {StockProblem, StockProblemType} from './StockProblem';
import {StockPatch} from './stock-patch';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs';

/**
 * Import a customer's stock data in an Excel sheet form.
 * Because customers have been known to include duplicate stock names,
 * the row number on the spreadsheet acts as the de facto id for the stock.
 * We go looking for a sheet called "raw-stocks"
 * We make use of the following columns
 * name - typically a stock number like 2301 or 1472.03
 * dob - a string representation of the fertilization date of the stock
 * genetics -  string description of the stock's transgenes and mutations
 * mom - the stock number of the mom, SHOULD have this is mom is from the facility
 * dad
 * researcher - the researcher who is working on the stock
 * countEnteringNursery - how many embryos entered the nursery
 * countLeavingNursery - how many embryos left the nursery
 * comment - an ad-hoc comment about the stock
 * **ALL OTHER COLUMNS ARE IGNORED** but there is no harm leaving them there
 */

const RAW_STOCKS_WORKBOOK = 'raw-stocks.xlsm';
const RAW_STOCKS_SHEET = 'raw-stocks';
const ALL_PROBLEM_TYPES = null;
const STOCK_PROBLEM_FOCUS_STATE = 'stockProblemFocus';

@Component({
  selector: 'app-stock-migrator',
  templateUrl: './stock-migrator.component.html',
  styleUrls: ['./stock-migrator.component.css']
})
export class StockMigratorComponent implements OnInit {
  // The set of problems we run into loading data from the raw-stock
  // excel file.  These are not specific to any one stock, but more
  // about the problems with the book as a whole.
  loadingProblems: string[] = [];

  // The set of problems we try to resolve with stock data
  StockProblemTypes = StockProblemType;
  stockProblemTypes: string[] = Object.values(StockProblemType);

  // The set of raw stocks
  stocks: Stock[] = [];

  // A set of patches provided by the user.
  // This set of patches has to persist over restarts
  patches: StockPatch[] = [];

  // What type of problem is the user focusing on.  null is no focus = all problems.
  stockProblemFocus: string | null = null;

  // The stock and problem the user is currently working on (patching)
  selectedProblem: StockProblem | null = null;
  selectedStock: Stock | null = null;
  selectedStockDuplicates: StockProblem | undefined;
  selectedPatch: StockPatch | undefined;

  // A form control for the user to have a quick peek at any stock, by number
  stockPeekFC: FormControl = new FormControl();
  stockPeek: Stock | undefined;

  constructor(
    private appState: AppStateService,
    private httpClient: HttpClient,
  ) { }

  ngOnInit(): void {
    this.loadRawStocks();
    // for rememory over restarts. Now, where was I?
    const focus = this.appState.getState(STOCK_PROBLEM_FOCUS_STATE);
    if (focus) {
      this.stockProblemFocus = focus as string;
    }
    this.stockPeekFC.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value: string) => {
        this.stockPeek = this.stockExists(value), null, 2;
      })
  }

  focusOnProblemType() {
    this.appState.setState(STOCK_PROBLEM_FOCUS_STATE, this.stockProblemFocus, true);
    this.selectedProblem = null;
    this.selectedStock = null;
  }


  stockExists(stockName: string): Stock | undefined {
    return this.stocks.find((s: Stock) => {
      return s && s.checkName(stockName);
    })
  }

  patchExists(stockName: string | undefined): StockPatch | undefined {
    return this.patches.find((patch: StockPatch) => {
      return patch.checkName(stockName);
    })
  }

  // When the user chooses a problem, set up the environment for patching it.
  problemSelected(problem: {stock: Stock, problem: StockProblem}) {
    this.selectedProblem = problem.problem;
    this.selectedStock = problem.stock;

    // find a patch for the stock if it exists, otherwise create a new patch for it.
    // flag stocks with duplicates because we can't patch them.
    this.selectedStockDuplicates = this.selectedStock.getDuplicates();
    if (this.selectedStockDuplicates) {
      this.selectedPatch = undefined;
    } else {
      this.selectedPatch = this.patchExists(this.selectedStock.stockName);
      if (!this.selectedPatch) {
        this.selectedPatch = new StockPatch(this.selectedStock)
        this.patches.push(this.selectedPatch);
      }
    }
  }

  loadRawStocks() {
    this.stocks = [];
    this.httpClient.get(
      `assets/${this.appState.getState(WellKnownStates.FACILITY)}/${RAW_STOCKS_WORKBOOK}`,
      {responseType: 'blob'}
    ).subscribe((data: any) => {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const rawStocksWb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        if (!rawStocksWb) {
          this.loadingProblems.push(`Could not read ${RAW_STOCKS_WORKBOOK} workbook.`);
          return;
        }

        const ws = rawStocksWb.Sheets[RAW_STOCKS_SHEET];
        if (!ws) {
          this.loadingProblems.push(`Could not find worksheet: ${RAW_STOCKS_SHEET}.`);
          return;
        }

        this.loadStocks(XLSX.utils.sheet_to_json(ws));
        this.checkDuplicates();
        this.checkLineage();
      }
      reader.readAsBinaryString(data);
    });
  }

  loadStocks(rawStocks: any[]) {
    let index = -1;
    for (const rawStock of rawStocks) {
      index++;
      // In excel the first stock is on row 2, but the index in the array is 0;
      const stock: Stock = new Stock(index + 2, rawStock);
      this.stocks[index] = stock;
    }
  }

  checkDuplicates() {
    this.stocks.forEach((stock: Stock) => {
      const dups: Stock[] = this.stocks.filter((otherStock: Stock) => stock.stockName === otherStock.stockName)
      if (dups.length > 1) {
        const dupRows: number[] = dups.map((s:Stock) =>  s.row);
        stock.addProblem(new StockProblem(StockProblemType.DUPLICATE_STOCK_NAME, `rows: ${dupRows.join('; ')}`))
      }
    })
  }

  // mom and dad should exist
  // mom and dad should be older than the stock
  // if the stock is a sub-stock, it should have the same parents and dob as the base stock
  checkLineage() {
    this.stocks.forEach((stock: Stock) => {
      if (stock.internalMom) {
        const mom: Stock | undefined = this.stockExists(stock.internalMom);
        if (mom) {
          if (stock.dob && mom.dob && stock.dob <= mom.dob) {
            stock.addProblem(new StockProblem(StockProblemType.TIME_TRAVELER, 'older than mom'))
          }
        } else {
          stock.addProblem(new StockProblem(StockProblemType.NO_SUCH_MOM));
        }
      }
      if (stock.internalDad) {
        const dad: Stock | undefined = this.stockExists(stock.internalDad);
        if (dad) {
          if (stock.dob && dad.dob && stock.dob <= dad.dob) {
            stock.addProblem(new StockProblem(StockProblemType.TIME_TRAVELER, 'older than dad'))
          }
        } else {
          stock.addProblem(new StockProblem(StockProblemType.NO_SUCH_DAD));
        }
      }
      if (stock.isSubstock()) {
        const baseStock: Stock| undefined = this.stockExists(String(stock.stockNumber));
        if (baseStock && stock.internalMom !== baseStock.internalMom) {
          stock.addProblem(new StockProblem(StockProblemType.SUBSTOCK_MOM_DIFFERENT_FROM_BASE_STOCK, `Base stock mom: ${baseStock.internalMom}`))
        }
        if (baseStock && stock.internalDad !== baseStock.internalDad) {
          stock.addProblem(new StockProblem(StockProblemType.SUBSTOCK_DAD_DIFFERENT_FROM_BASE_STOCK, `Base stock dad: ${baseStock.internalDad}`))
        }
        if (baseStock && stock.dob !== baseStock.dob) {
          stock.addProblem(new StockProblem(StockProblemType.SUBSTOCK_DOB_DIFFERENT_FROM_BASE_STOCK, `Base stock dob: ${baseStock.dob}`))
        }
      }
    });
  }
}


