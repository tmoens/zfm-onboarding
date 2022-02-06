import {Injectable} from '@angular/core';
import {Stock} from './stock';
import {StockPatch} from './stock-patch';
import {StockProblem, StockProblemFields, StockProblemType} from './stock-problem';
import {AppStateService, WellKnownStates} from '../app-state.service';
import {HttpClient} from '@angular/common/http';
import * as XLSX from 'xlsx';

/**
 * Import a customer's raw stock data from an Excel worksheet.
 *
 * Then acts like a database type service answering questions
 * and so on.
 *
 * TODO let the user choose where the spreadsheet is.
 * We go looking for a sheet called "raw-stocks"
 * We make use of the following columns
 * stockName - typically a stock number like 2301 or 1472.03
 * dob - a string representation of the fertilization date of the stock
 * genetics -  string description of the stock's transgenes and mutations
 * mom - the stock number of the mom, have this is mom is from the facility
 * dad - like mom
 * researcher - the researcher who is working on the stock
 * countEnteringNursery - how many embryos entered the nursery
 * countLeavingNursery - how many embryos left the nursery
 * comment - an ad-hoc comment about the stock
 * **ALL OTHER COLUMNS ARE IGNORED** but there is no harm in having them
 */

const RAW_STOCKS_WORKBOOK = 'raw-stocks.xlsm';
const RAW_STOCKS_SHEET = 'raw-stocks';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  // The set of problems we run into loading data from the raw-stock
  // excel file.  These are not specific to any one stock, but more
  // about the problems with the book as a whole.
  loadingProblems: string[] = [];

  // The set of raw stocks
  stocks: Stock[] = [];

  // A set of patches created by the user.
  // This set of patches has to persist over restarts
  patches: StockPatch[] = [];

  constructor(
    private appState: AppStateService,
    private httpClient: HttpClient,
  ) {
    this.loadRawStocks();
    // for rememory over restarts. Now, where was I?
  }

  findStock(stockName: string): Stock | undefined {
    return this.stocks.find((s: Stock) => {
      return s && s.checkName(stockName);
    })
  }

  // Find the patch for a stock if it exists;
  findPatchForStock(stock: Stock): StockPatch | undefined {
     return this.patches.find((patch: StockPatch) => {
      return patch.checkName(stock.stockName);
    });
  }

  // Get the patch for a stock, creating one if one does not already exist;
  getPatchForStock(stock: Stock): StockPatch {
    let patch = this.findPatchForStock(stock);
    if (!patch) {
      patch = new StockPatch(stock);
      this.patches.push(patch);
    }
    return patch;
  }

  getStockBefore(stock: Stock): Stock {
    if (stock.index === 0) {
      return this.stocks[this.stocks.length -1];
    } else {
      return this.stocks[stock.index - 1];
    }
  }

  getStockAfter(stock: Stock): Stock {
    if (stock.index === this.stocks.length - 1) {
      return this.stocks[0];
    } else {
      return this.stocks[stock.index + 1];
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
        const binaryString: string = e.target.result;
        const rawStocksWb: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
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
        this.checkForDuplicates();
        this.checkLineage();
        this.checkSubstocks();
      }
      reader.readAsBinaryString(data);
    });
  }

  loadStocks(rawStocks: any[]) {
    let index = -1;
    for (const rawStock of rawStocks) {
      index++;
      // In the worksheet, the first stock is on row 2, but the index in the array is 0;
      this.stocks[index] = new Stock(index + 2, rawStock);
    }
  }

  checkForDuplicates() {
    this.stocks.forEach((stock: Stock) => {
      const duplicates: Stock[] = this.stocks.filter((otherStock: Stock) => stock.stockName === otherStock.stockName)
      if (duplicates.length > 1) {
        stock.duplicates = duplicates.map((s:Stock) =>  s.row);
      }
    })
  }

  // if present, mom and dad should exist
  // mom and dad should be older than the stock
  checkLineage() {
    this.stocks.forEach((stock: Stock) => {
      if (stock.internalMom) {
        const mom: Stock | undefined = this.findStock(stock.internalMom);
        if (mom) {
          if (stock.dob && mom.dob && stock.dob <= mom.dob) {
            stock.addProblem(StockProblemFields.INTERNAL_MOM, new StockProblem(StockProblemType.TIME_TRAVELER))
            stock.addProblem(StockProblemFields.DOB, new StockProblem(StockProblemType.TIME_TRAVELER))
          }
        } else {
          stock.addProblem(StockProblemFields.INTERNAL_MOM, new StockProblem(StockProblemType.DOES_NOT_EXIST));
        }
      }
      if (stock.internalDad) {
        const dad: Stock | undefined = this.findStock(stock.internalDad);
        if (dad) {
          if (stock.dob && dad.dob && stock.dob <= dad.dob) {
            stock.addProblem(StockProblemFields.INTERNAL_DAD, new StockProblem(StockProblemType.TIME_TRAVELER, 'older than dad'))
            stock.addProblem(StockProblemFields.DOB, new StockProblem(StockProblemType.TIME_TRAVELER))
          }
        } else {
          stock.addProblem(StockProblemFields.INTERNAL_DAD, new StockProblem(StockProblemType.DOES_NOT_EXIST));
        }
      }
    });
  }


  // if the stock is a sub-stock, it should have the same parents and dob as the base stock
  checkSubstocks() {
    this.stocks.forEach((stock: Stock) => {
      if (stock.isSubstock()) {
        const baseStock: Stock| undefined = this.findStock(String(stock.stockNumber));
        if (baseStock && stock.internalMom !== baseStock.internalMom) {
          stock.addProblem(StockProblemFields.INTERNAL_MOM, new StockProblem(StockProblemType.SUBSTOCK_DIFFERENT_THAN_BASE_STOCK, `Base stock mom: ${baseStock.internalMom}`))
        }
        if (baseStock && stock.internalDad !== baseStock.internalDad) {
          stock.addProblem(StockProblemFields.INTERNAL_DAD, new StockProblem(StockProblemType.SUBSTOCK_DIFFERENT_THAN_BASE_STOCK, `Base stock dad: ${baseStock.internalDad}`))
        }
        if (baseStock && stock.dob !== baseStock.dob) {
          stock.addProblem(StockProblemFields.DOB, new StockProblem(StockProblemType.SUBSTOCK_DIFFERENT_THAN_BASE_STOCK, `Base stock dob: ${baseStock.dob}`))
        }
      }
    });
  }
}
